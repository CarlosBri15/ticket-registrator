import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, inArray, gte, lte, ilike, count, desc, SQL, isNull, sql } from 'drizzle-orm';
import { IReport, ReportStatus, ROLE_HIERARCHY, Roles, PaginatedList, permissions, AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import type { RoleType, PermissionType, ReportStatusType } from '@ticket-registrator/shared';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportFieldsDto, UpdateReportStatusDto } from './dto/update-report.dto';
import { mapReportToIReport } from './mapper/report.mapper';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
  ) { }

  // Helper to check if user exists and is visible, including relations
  private async getVisibleUser(id: string) {
    const user = await this.db.query.users.findFirst({
      where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
      with: {
        usersToRoles: { with: { role: true } },
        usersToDepartments: true
      }
    });
    if (!user) throw new NotFoundException('User not found or not visible');
    return user;
  }

  async create(id: string, dto: CreateReportDto): Promise<IReport> {
    await this.getVisibleUser(id);

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
      throw new ConflictException('A report already exists for this trip date range');
    }

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

  async findUserReports(requester: any, targetUserId: string): Promise<IReport[]> {
    const targetUser = await this.getVisibleUser(targetUserId);

    if (requester.id !== targetUserId) {
      let allowed = false;
      const requesterHierarchy = Math.max(...requester.roleHierarchies);

      const targetRoles = targetUser.usersToRoles.map(ur => ur.role);
      const targetHierarchy = targetRoles.length > 0 ? Math.max(...targetRoles.map(r => r.hierarchy)) : 0;
      const targetDeptIds = targetUser.usersToDepartments.map(ud => ud.departmentId);

      if (requesterHierarchy >= AUTHORITY_LEVELS.GLOBAL) {
        allowed = true;
      } else if (requesterHierarchy >= AUTHORITY_LEVELS.COMPANY && targetUser.companyId === requester.companyId && targetHierarchy < requesterHierarchy) {
        allowed = true;
      } else if (requesterHierarchy >= AUTHORITY_LEVELS.DEPARTMENT && targetUser.companyId === requester.companyId && targetDeptIds.some(id => requester.departmentIds.includes(id)) && targetHierarchy < requesterHierarchy) {
        allowed = true;
      }

      if (!allowed) throw new ForbiddenException('You do not have permission to view this user\'s reports');
    }

    const reports = await this.db.query.reports.findMany({
      where: and(eq(schema.reports.userId, targetUserId), eq(schema.reports.isVisible, true))
    });

    return reports.map(report => mapReportToIReport(report));
  }

  async findAllReports(requester: any): Promise<IReport[]> {
    const maxHierarchy = Math.max(...requester.roleHierarchies);
    let userFilters = [isNull(schema.users.deletedAt)];

    if (maxHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      userFilters.push(eq(schema.users.companyId, requester.companyId));

      if (maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT && maxHierarchy < AUTHORITY_LEVELS.COMPANY) {
        userFilters.push(sql`EXISTS (
          SELECT 1 FROM ${schema.usersToDepartments} ud 
          WHERE ud.user_id = ${schema.users.id} 
          AND ud.department_id = ANY(${requester.departmentIds}::uuid[])
        )`);
      } else if (maxHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
        userFilters.push(eq(schema.users.id, requester.id));
      }
    }

    if (maxHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      userFilters.push(sql`EXISTS (
          SELECT 1 FROM ${schema.usersToRoles} ur
          JOIN ${schema.roles} r ON r.id = ur.role_id
          WHERE ur.user_id = ${schema.users.id}
          GROUP BY ur.user_id
          HAVING MAX(r.hierarchy) < ${maxHierarchy}
      ) OR ${schema.users.id} = ${requester.id}`);
    }

    const users = await this.db.query.users.findMany({
      where: and(...userFilters),
      columns: { id: true }
    });

    const visibleUserIds = [...new Set([...users.map(u => u.id), requester.id])];

    const reportsList = await this.db.query.reports.findMany({
      where: and(inArray(schema.reports.userId, visibleUserIds), eq(schema.reports.isVisible, true))
    });

    return reportsList.map(report => mapReportToIReport(report));
  }

  async findAllReportsPaginated(requester: any, filters: any): Promise<PaginatedList<IReport>> {
    const { page = 1, limit = 10, userId, name, startDate, endDate, status } = filters;
    const offset = (page - 1) * limit;
    const maxHierarchy = Math.max(...requester.roleHierarchies);

    let authorityWhere: SQL<unknown> | undefined = undefined;

    if (maxHierarchy >= AUTHORITY_LEVELS.GLOBAL) {
      authorityWhere = isNull(schema.users.deletedAt);
    } else if (maxHierarchy >= AUTHORITY_LEVELS.COMPANY) {
      authorityWhere = and(eq(schema.users.companyId, requester.companyId), isNull(schema.users.deletedAt));
    } else if (maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT) {
      authorityWhere = and(
        eq(schema.users.companyId, requester.companyId),
        sql`EXISTS (SELECT 1 FROM ${schema.usersToDepartments} ud WHERE ud.user_id = ${schema.users.id} AND ud.department_id = ANY(${requester.departmentIds}::uuid[]))`,
        isNull(schema.users.deletedAt)
      );
    } else {
      authorityWhere = eq(schema.users.id, requester.id);
    }

    const finalAuthorityWhere = or(authorityWhere, eq(schema.users.id, requester.id));
    const queryFilters = [eq(schema.reports.isVisible, true)];

    if (userId) queryFilters.push(eq(schema.reports.userId, userId));
    if (name) queryFilters.push(ilike(schema.reports.name, `%${name}%`));
    if (status) queryFilters.push(eq(schema.reports.status, status as string));
    if (startDate) queryFilters.push(gte(schema.reports.startDate, new Date(startDate)));
    if (endDate) queryFilters.push(lte(schema.reports.endDate, new Date(endDate)));

    const results = await this.db.select({ report: schema.reports })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(...queryFilters, finalAuthorityWhere))
      .orderBy(desc(schema.reports.createdAt))
      .limit(limit)
      .offset(offset);

    const countRes = await this.db.select({ count: count() })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(and(...queryFilters, finalAuthorityWhere));

    const total = Number(countRes[0]?.count ?? 0);

    return {
      data: results.map(row => mapReportToIReport(row.report)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(requester: any, reportId: string): Promise<IReport> {
    const report = await this.db.query.reports.findFirst({ where: eq(schema.reports.id, reportId) });
    if (!report || !report.isVisible) throw new NotFoundException('Report not found');

    const reportOwner = await this.getVisibleUser(report.userId);
    if (reportOwner.id === requester.id) return mapReportToIReport(report);

    const requesterHierarchy = Math.max(...requester.roleHierarchies);
    const targetRoles = reportOwner.usersToRoles.map(ur => ur.role);
    const targetHierarchy = targetRoles.length > 0 ? Math.max(...targetRoles.map(r => r.hierarchy)) : 0;
    const targetDeptIds = reportOwner.usersToDepartments.map(ud => ud.departmentId);

    let allowed = false;
    if (requesterHierarchy >= AUTHORITY_LEVELS.GLOBAL) {
      allowed = true;
    } else if (requesterHierarchy >= AUTHORITY_LEVELS.COMPANY && reportOwner.companyId === requester.companyId && targetHierarchy < requesterHierarchy) {
      allowed = true;
    } else if (requesterHierarchy >= AUTHORITY_LEVELS.DEPARTMENT && reportOwner.companyId === requester.companyId && targetDeptIds.some(id => requester.departmentIds.includes(id)) && targetHierarchy < requesterHierarchy) {
      allowed = true;
    }

    if (allowed) return mapReportToIReport(report);
    throw new ForbiddenException('You do not have permission to view this report');
  }

  async update(userId: string, reportId: string, dto: UpdateReportFieldsDto): Promise<IReport> {
    const report = await this.db.query.reports.findFirst({
      where: and(eq(schema.reports.id, reportId), eq(schema.reports.userId, userId), eq(schema.reports.isVisible, true), eq(schema.reports.status, ReportStatus.CREATED))
    });
    if (!report) throw new NotFoundException('Report not found or cannot be updated');

    const updateData: any = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.start_date !== undefined) updateData.startDate = new Date(dto.start_date);
    if (dto.end_date !== undefined) updateData.endDate = new Date(dto.end_date);
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.isVisible !== undefined) updateData.isVisible = dto.isVisible;

    const [updated] = await this.db.update(schema.reports).set(updateData).where(eq(schema.reports.id, report.id)).returning();
    return mapReportToIReport(updated);
  }

  async updateStatus(reportId: string, dto: UpdateReportStatusDto): Promise<IReport> {
    const [updated] = await this.db.update(schema.reports).set({ status: dto.status as string, updatedAt: new Date() }).where(and(eq(schema.reports.id, reportId), eq(schema.reports.status, ReportStatus.SUBMITTED), eq(schema.reports.isVisible, true))).returning();
    if (!updated) throw new ConflictException('Report not found or cannot be reviewed');
    return mapReportToIReport(updated);
  }

  async submitReport(userId: string, reportId: string): Promise<IReport> {
    const [updated] = await this.db.update(schema.reports).set({ status: ReportStatus.SUBMITTED, updatedAt: new Date() }).where(and(eq(schema.reports.id, reportId), eq(schema.reports.userId, userId), eq(schema.reports.status, ReportStatus.CREATED), eq(schema.reports.isVisible, true))).returning();
    if (!updated) throw new ConflictException('Report not found or cannot be submitted');
    return mapReportToIReport(updated);
  }

  async remove(userId: string, reportId: string) {
    const report = await this.db.query.reports.findFirst({ where: and(eq(schema.reports.id, reportId), eq(schema.reports.userId, userId)) });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) throw new ConflictException('Cannot remove a report after submission');

    await this.db.transaction(async (tx) => {
      await tx.update(schema.reports).set({ isVisible: false, updatedAt: new Date() }).where(eq(schema.reports.id, reportId));
      await tx.update(schema.tickets).set({ isVisible: false, updatedAt: new Date() }).where(eq(schema.tickets.reportId, reportId));
    });
    return { deleted: true };
  }
}
