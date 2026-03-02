import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, inArray, gte, lte, ilike, count, desc, SQL } from 'drizzle-orm';
import { IReport, ReportStatus, ROLE_HIERARCHY, Roles, PaginatedList } from '@ticket-registrator/shared';
import type { RoleType, PermissionType, ReportStatusType } from '@ticket-registrator/shared';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportFieldsDto, UpdateReportStatusDto } from './dto/update-report.dto';
import { mapReportToIReport } from './mapper/report.mapper';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
  ) { }

  // Helper to check if user exists and is visible
  private async getVisibleUser(id: string) {
    const user = await this.db.query.users.findFirst({
      where: and(eq(schema.users.id, id), eq(schema.users.isVisible, true))
    });
    if (!user) throw new NotFoundException('User not found or not visible');
    return user;
  }

  async create(id: string, dto: CreateReportDto): Promise<IReport> {
    await this.getVisibleUser(id);  // Ensure user exists and is visible

    const overlapping = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.userId, id),
        or(
          and(
            lte(schema.reports.startDate, new Date(dto.end_date!)),
            gte(schema.reports.endDate, new Date(dto.start_date!))
          )
        )
      )
    });

    if (overlapping) {
      throw new ConflictException(
        'A report already exists for this trip date range',
      );
    }

    // Create report
    const [report] = await this.db.insert(schema.reports).values({
      userId: id,
      requestedAmount: 0,
      approvedAmount: 0,
      status: ReportStatus.CREATED as any,
      name: dto.name,
      startDate: new Date(dto.start_date!),
      endDate: new Date(dto.end_date!),
      currency: dto.currency,
      type: dto.type ?? '',
      isVisible: dto.isVisible ?? true,
    } as any).returning();

    return mapReportToIReport(report);
  }

  async findUserReports(
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId?: string;
      permissions: PermissionType[];
    },
    targetUserId: string
  ): Promise<IReport[]> {
    await this.getVisibleUser(requester.id);
    const targetUser = await this.getVisibleUser(targetUserId);

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    // TODO: Re-enable once new roles/permissions system is complete
    // const targetHierarchy = ROLE_HIERARCHY[targetUser.role as RoleType];
    const targetHierarchy = 0; // placeholder

    // Permission checks
    if (requester.id === targetUserId) {
      if (!requester.permissions.includes('view_own_reports')) {
        throw new ForbiddenException('You do not have permission to view your own reports');
      }
    } else {
      let allowed = false;

      // Manager: can view reports of users in their department
      if (
        requester.role === Roles.MANAGER &&
        requester.permissions.includes('view_team_reports') &&
        targetUser.companyId === requester.companyId &&
        targetUser.departmentId === requester.departmentId
      ) {
        allowed = true;
      }

      // Admin/SuperAdmin: can view reports in company, but only lower hierarchy
      if (
        (requester.role === Roles.ADMIN || requester.role === Roles.SUPERADMIN) &&
        requester.permissions.includes('view_all_reports') &&
        targetUser.companyId === requester.companyId &&
        targetHierarchy < requesterHierarchy
      ) {
        allowed = true;
      }

      if (!allowed) {
        throw new ForbiddenException('You do not have permission to view this user\'s reports');
      }
    }

    const reports = await this.db.query.reports.findMany({
      where: and(
        eq(schema.reports.userId, targetUserId),
        eq(schema.reports.isVisible, true)
      )
    });

    console.log('Reports found:', reports);
    return reports.map(report => mapReportToIReport(report));
  }

  async findAllReports(requester: {
    id: string;
    role: RoleType;
    companyId: string;
    departmentId: string;
    permissions: PermissionType[];
  }): Promise<IReport[]> {

    await this.getVisibleUser(requester.id);

    if (
      !requester.permissions.includes("view_own_reports") &&
      !requester.permissions.includes("view_team_reports") &&
      !requester.permissions.includes("view_all_reports")
    ) {
      throw new ForbiddenException('You are not allowed to view reports');
    }

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    let userFilters = [
      eq(schema.users.companyId, requester.companyId),
      eq(schema.users.isVisible, true)
    ];

    if (requester.permissions.includes("view_all_reports")) {
      if (requester.role !== Roles.SUPERADMIN) {
        const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
          role => ROLE_HIERARCHY[role] < requesterHierarchy
        );
        // TODO: Re-enable role filter once new roles/permissions system is complete
        // userFilters.push(inArray(schema.users.role, allowedRoles));
        void allowedRoles; // suppress unused variable warning
      }
    } else if (requester.permissions.includes("view_team_reports")) {
      userFilters.push(eq(schema.users.departmentId, requester.departmentId));
      const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
        role => ROLE_HIERARCHY[role] < requesterHierarchy
      );
      // TODO: Re-enable role filter once new roles/permissions system is complete
      // userFilters.push(inArray(schema.users.role, allowedRoles));
    } else {
      userFilters.push(eq(schema.users.id, requester.id));
    }

    const users = await this.db.query.users.findMany({
      where: and(...userFilters),
      columns: { id: true }
    });

    let visibleUserIds = users.map(u => u.id);
    if (!visibleUserIds.includes(requester.id)) {
      visibleUserIds.push(requester.id);
    }

    const reportsList = await this.db.query.reports.findMany({
      where: and(
        inArray(schema.reports.userId, visibleUserIds),
        eq(schema.reports.isVisible, true)
      )
    });

    return reportsList.map(report => mapReportToIReport(report));
  }

  async findAllReportsPaginated(
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    },
    filters: {
      userId?: string;
      name?: string;
      startDate?: string;
      endDate?: string;
      status?: ReportStatusType;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedList<IReport>> {
    await this.getVisibleUser(requester.id);

    const {
      page = 1,
      limit = 10,
      userId,
      name,
      startDate,
      endDate,
      status
    } = filters;

    const offset = (page - 1) * limit;

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    let authorityWhere: SQL<unknown> | undefined = undefined;

    if (requester.permissions.includes('view_all_reports')) {
      if (requester.role === Roles.SUPERADMIN) {
        // SuperAdmin sees all
        authorityWhere = eq(schema.users.isVisible, true);
      } else {
        // Admin sees all in company below them
        const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
          role => ROLE_HIERARCHY[role] < requesterHierarchy
        );
        authorityWhere = and(
          eq(schema.users.companyId, requester.companyId),
          // TODO: Re-enable role filter once new roles/permissions system is complete
          // inArray(schema.users.role, allowedRoles),
          eq(schema.users.isVisible, true)
        );
      }
    } else if (requester.permissions.includes('view_team_reports')) {
      // Manager sees their department below them
      const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
        role => ROLE_HIERARCHY[role] < requesterHierarchy
      );
      void allowedRoles; // suppress unused variable warning
      authorityWhere = and(
        eq(schema.users.companyId, requester.companyId),
        eq(schema.users.departmentId, requester.departmentId),
        // TODO: Re-enable role filter once new roles/permissions system is complete
        // inArray(schema.users.role, allowedRoles),
        eq(schema.users.isVisible, true)
      );
    } else {
      // User sees only themselves
      authorityWhere = eq(schema.users.id, requester.id);
    }

    // Include the requester so they can see their own reports in addition to others
    const finalAuthorityWhere = or(
      authorityWhere,
      eq(schema.users.id, requester.id)
    );

    // 2. Build User-provided Query Filters
    const queryFilters = [
      eq(schema.reports.isVisible, true)
    ];

    if (userId) {
      queryFilters.push(eq(schema.reports.userId, userId));
    }
    if (name) {
      queryFilters.push(ilike(schema.reports.name, `%${name}%`));
    }
    if (status) {
      queryFilters.push(eq(schema.reports.status, status as string));
    }
    if (startDate) {
      queryFilters.push(gte(schema.reports.startDate, new Date(startDate)));
    }
    if (endDate) {
      queryFilters.push(lte(schema.reports.endDate, new Date(endDate)));
    }

    const reportWhere = and(...queryFilters);

    // 3. Execute efficient Join Query
    // Drizzle let us join cleanly
    const baseQuery = this.db.select({
      report: schema.reports
    })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(reportWhere, finalAuthorityWhere));

    // Get Total Count
    const totalCountQuery = await this.db.select({ count: count() })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(reportWhere, finalAuthorityWhere));

    const total = Number(totalCountQuery[0]?.count ?? 0);

    // Get Paginated Data
    const results = await baseQuery
      .orderBy(desc(schema.reports.createdAt))
      .limit(limit)
      .offset(offset);

    const reports = results.map(row => mapReportToIReport(row.report));

    return {
      data: reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    },
    reportId: string
  ): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const report = await this.db.query.reports.findFirst({
      where: eq(schema.reports.id, reportId)
    });

    if (!report || !report.isVisible) {
      throw new NotFoundException('Report not found');
    }

    const reportOwner = await this.getVisibleUser(report.userId);
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    // TODO: Re-enable once new roles/permissions system is complete
    // const targetHierarchy = ROLE_HIERARCHY[reportOwner.role as RoleType];
    const targetHierarchy = 0; // placeholder

    if (reportOwner.id === requester.id) {
      if (!requester.permissions.includes('view_own_reports')) {
        throw new ForbiddenException('You do not have permission to view your own reports');
      }
      return mapReportToIReport(report);
    }

    // Manager
    if (
      requester.permissions.includes('view_team_reports') &&
      reportOwner.companyId === requester.companyId &&
      reportOwner.departmentId === requester.departmentId
    ) {
      return mapReportToIReport(report);
    }

    // Admin/SuperAdmin
    if (
      requester.permissions.includes('view_all_reports') &&
      reportOwner.companyId === requester.companyId &&
      targetHierarchy < requesterHierarchy
    ) {
      return mapReportToIReport(report);
    }

    throw new ForbiddenException('You do not have permission to view this report');
  }

  async update(userId: string, reportId: string, updateReportDto: UpdateReportFieldsDto): Promise<IReport> {
    await this.getVisibleUser(userId);

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, userId),
        eq(schema.reports.isVisible, true),
        eq(schema.reports.status, ReportStatus.CREATED)
      )
    });

    if (!report) {
      throw new NotFoundException(
        'Report not found or cannot be updated (status must be CREATED)',
      );
    }

    const updateData: any = {};
    if (updateReportDto.name !== undefined) updateData.name = updateReportDto.name;
    if (updateReportDto.start_date !== undefined) updateData.startDate = new Date(updateReportDto.start_date);
    if (updateReportDto.end_date !== undefined) updateData.endDate = new Date(updateReportDto.end_date);
    if (updateReportDto.type !== undefined) updateData.type = updateReportDto.type;
    if (updateReportDto.isVisible !== undefined) updateData.isVisible = updateReportDto.isVisible;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    updateData.updatedAt = new Date();

    const [updatedReport] = await this.db.update(schema.reports)
      .set(updateData)
      .where(eq(schema.reports.id, report.id))
      .returning();

    return mapReportToIReport(updatedReport);
  }

  async updateStatus(reportId: string, dto: UpdateReportStatusDto): Promise<IReport> {
    const [updatedReport] = await this.db.update(schema.reports)
      .set({ status: dto.status as string, updatedAt: new Date() })
      .where(and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.status, ReportStatus.SUBMITTED),
        eq(schema.reports.isVisible, true)
      ))
      .returning();

    if (!updatedReport) {
      throw new ConflictException(
        'Report not found or cannot be reviewed (status must be SUBMITTED)',
      );
    }

    return mapReportToIReport(updatedReport);
  }

  async submitReport(userId: string, reportId: string): Promise<IReport> {
    await this.getVisibleUser(userId);

    const [updatedReport] = await this.db.update(schema.reports)
      .set({ status: ReportStatus.SUBMITTED, updatedAt: new Date() })
      .where(and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, userId),
        eq(schema.reports.status, ReportStatus.CREATED),
        eq(schema.reports.isVisible, true)
      ))
      .returning();

    if (!updatedReport) {
      throw new ConflictException(
        'Report not found or cannot be submitted (status must be CREATED)',
      );
    }

    return mapReportToIReport(updatedReport);
  }

  async remove(userId: string, reportId: string) {
    await this.getVisibleUser(userId);

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, userId)
      )
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot remove a report after submission');
    }

    await this.db.update(schema.reports)
      .set({ isVisible: false, updatedAt: new Date() })
      .where(eq(schema.reports.id, report.id));

    // Cascade: hide tickets
    await this.db.update(schema.tickets)
      .set({ isVisible: false, updatedAt: new Date() })
      .where(eq(schema.tickets.reportId, report.id));

    return { deleted: true };
  }
}
