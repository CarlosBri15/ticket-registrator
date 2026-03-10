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

type Requester = {
  id: string;
  role: RoleType;
  companyId: string;
  departmentId: string;
  permissions: PermissionType[];
};

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

  async create(requester: Requester, dto: CreateReportDto): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const overlapping = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.userId, requester.id),
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

    const [report] = await this.db.insert(schema.reports).values({
      userId: requester.id,
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

  async findUserReports(requester: Requester, targetUserId: string): Promise<IReport[]> {
    await this.getVisibleUser(requester.id);
    const targetUser = await this.getVisibleUser(targetUserId);

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    // TODO: Re-enable once new roles/permissions system is complete
    // const targetHierarchy = ROLE_HIERARCHY[targetUser.role as RoleType];
    const targetHierarchy = 0; // placeholder

    if (requester.id !== targetUserId) {
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

    return reports.map(report => mapReportToIReport(report));
  }

  async findAllReports(requester: Requester): Promise<IReport[]> {
    await this.getVisibleUser(requester.id);

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    const userFilters: ReturnType<typeof eq>[] = [
      eq(schema.users.companyId, requester.companyId),
      eq(schema.users.isVisible, true),
    ];

    if (requester.permissions.includes('view_all_reports')) {
      if (requester.role !== Roles.SUPERADMIN) {
        // TODO: Re-enable role filter once new roles/permissions system is complete
        // const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
        //   role => ROLE_HIERARCHY[role] < requesterHierarchy
        // );
        // userFilters.push(inArray(schema.users.role, allowedRoles));
        void requesterHierarchy;
      }
    } else if (requester.permissions.includes('view_team_reports')) {
      userFilters.push(eq(schema.users.departmentId, requester.departmentId));
      // TODO: Re-enable role filter once new roles/permissions system is complete
      // const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
      //   role => ROLE_HIERARCHY[role] < requesterHierarchy
      // );
      // userFilters.push(inArray(schema.users.role, allowedRoles));
    } else {
      userFilters.push(eq(schema.users.id, requester.id));
    }

    const users = await this.db.query.users.findMany({
      where: and(...userFilters),
      columns: { id: true },
    });

    const visibleUserIds = users.map(u => u.id);
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
    requester: Requester,
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
        authorityWhere = eq(schema.users.isVisible, true);
      } else {
        // TODO: Re-enable role filter once new roles/permissions system is complete
        // const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
        //   role => ROLE_HIERARCHY[role] < requesterHierarchy
        // );
        void requesterHierarchy;
        authorityWhere = and(
          eq(schema.users.companyId, requester.companyId),
          eq(schema.users.isVisible, true)
        );
      }
    } else if (requester.permissions.includes('view_team_reports')) {
      // TODO: Re-enable role filter once new roles/permissions system is complete
      // const allowedRoles = (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
      //   role => ROLE_HIERARCHY[role] < requesterHierarchy
      // );
      authorityWhere = and(
        eq(schema.users.companyId, requester.companyId),
        eq(schema.users.departmentId, requester.departmentId),
        eq(schema.users.isVisible, true)
      );
    } else {
      authorityWhere = eq(schema.users.id, requester.id);
    }

    // Always include the requester's own reports
    const finalAuthorityWhere = or(
      authorityWhere,
      eq(schema.users.id, requester.id)
    );

    const queryFilters = [eq(schema.reports.isVisible, true)];

    if (userId) queryFilters.push(eq(schema.reports.userId, userId));
    if (name) queryFilters.push(ilike(schema.reports.name, `%${name}%`));
    if (status) queryFilters.push(eq(schema.reports.status, status as string));
    if (startDate) queryFilters.push(gte(schema.reports.startDate, new Date(startDate)));
    if (endDate) queryFilters.push(lte(schema.reports.endDate, new Date(endDate)));

    const reportWhere = and(...queryFilters);

    const baseQuery = this.db.select({ report: schema.reports })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(reportWhere, finalAuthorityWhere));

    const totalCountQuery = await this.db.select({ count: count() })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(reportWhere, finalAuthorityWhere));

    const total = Number(totalCountQuery[0]?.count ?? 0);

    const results = await baseQuery
      .orderBy(desc(schema.reports.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(row => mapReportToIReport(row.report)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(requester: Requester, reportId: string): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.isVisible, true),
      )
    });

    if (!report) throw new NotFoundException('Report not found');

    const reportOwner = await this.getVisibleUser(report.userId);
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    // TODO: Re-enable once new roles/permissions system is complete
    // const targetHierarchy = ROLE_HIERARCHY[reportOwner.role as RoleType];
    const targetHierarchy = 0; // placeholder

    // Own report
    if (reportOwner.id === requester.id) {
      return mapReportToIReport(report);
    }

    // Manager: same department
    if (
      requester.permissions.includes('view_team_reports') &&
      reportOwner.companyId === requester.companyId &&
      reportOwner.departmentId === requester.departmentId
    ) {
      return mapReportToIReport(report);
    }

    // Admin/SuperAdmin: same company, lower hierarchy
    if (
      requester.permissions.includes('view_all_reports') &&
      reportOwner.companyId === requester.companyId &&
      targetHierarchy < requesterHierarchy
    ) {
      return mapReportToIReport(report);
    }

    throw new ForbiddenException('You do not have permission to view this report');
  }

  async update(requester: Requester, reportId: string, updateReportDto: UpdateReportFieldsDto): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true),
        eq(schema.reports.status, ReportStatus.CREATED)
      )
    });

    if (!report) {
      throw new NotFoundException('Report not found or cannot be updated (status must be CREATED)');
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

  async updateStatus(requester: Requester, reportId: string, dto: UpdateReportStatusDto): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const [updatedReport] = await this.db.update(schema.reports)
      .set({ status: dto.status as string, updatedAt: new Date() })
      .where(and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.status, ReportStatus.SUBMITTED),
        eq(schema.reports.isVisible, true)
      ))
      .returning();

    if (!updatedReport) {
      throw new ConflictException('Report not found or cannot be reviewed (status must be SUBMITTED)');
    }

    return mapReportToIReport(updatedReport);
  }

  async submitReport(requester: Requester, reportId: string): Promise<IReport> {
    await this.getVisibleUser(requester.id);

    const [updatedReport] = await this.db.update(schema.reports)
      .set({ status: ReportStatus.SUBMITTED, updatedAt: new Date() })
      .where(and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.status, ReportStatus.CREATED),
        eq(schema.reports.isVisible, true)
      ))
      .returning();

    if (!updatedReport) {
      throw new ConflictException('Report not found or cannot be submitted (status must be CREATED)');
    }

    return mapReportToIReport(updatedReport);
  }

  async remove(requester: Requester, reportId: string) {
    await this.getVisibleUser(requester.id);

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true),
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
