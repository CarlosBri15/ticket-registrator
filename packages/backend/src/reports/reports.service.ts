import { Injectable, Logger } from '@nestjs/common';
import {
  eq,
  and,
  or,
  gte,
  lte,
  ilike,
  desc,
  isNull,
  sql,
  SQL,
} from 'drizzle-orm';
import {
  IReport,
  ReportStatus,
  AUTHORITY_LEVELS,
  PaginatedList,
} from '@ticket-registrator/shared';
import * as schema from '../db/schema';
import { CreateReportDto } from './dto/create-report.dto';
import {
  UpdateReportFieldsDto,
  UpdateReportStatusDto,
} from './dto/update-report.dto';
import { mapReportToIReport } from './mapper/report.mapper';
import { ReportsRepository } from './reports.repository';
import { ReportsAuthorizationService } from './reports-authorization.service';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import {
  ReportNotFoundException,
  ReportAlreadyExistsException,
  ReportUnauthorizedException,
  ReportStatusConflictException,
} from './exceptions/reports.exceptions';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly reportsAuthorizationService: ReportsAuthorizationService,
  ) {}

  async create(requester: UserPayload, dto: CreateReportDto): Promise<IReport> {
    await this.reportsAuthorizationService.getVisibleUser(requester.id);

    const overlapping = await this.reportsRepository.findOverlapping(
      requester.id,
      new Date(dto.start_date!),
      new Date(dto.end_date!),
    );

    if (overlapping) {
      throw new ReportAlreadyExistsException();
    }

    const report = await this.reportsRepository.create({
      userId: requester.id,
      requestedAmount: 0,
      approvedAmount: 0,
      status: ReportStatus.CREATED as any,
      name: dto.name,
      startDate: new Date(dto.start_date!),
      endDate: new Date(dto.end_date!),
      currency: dto.currency,
      type: dto.type ?? '',
    } as any);

    this.logger.log(`Report created: ${report.id} by user ${requester.id}`);
    return mapReportToIReport(report);
  }

  async findUserReports(
    requester: UserPayload,
    targetUserId: string,
  ): Promise<IReport[]> {
    const allowed = await this.reportsAuthorizationService.canViewUserReports(
      requester,
      targetUserId,
    );
    if (!allowed) {
      throw new ReportUnauthorizedException(
        "You do not have permission to view this user's reports",
      );
    }

    const reports = await this.reportsRepository.findByUserId(targetUserId);
    return reports.map((report) => mapReportToIReport(report));
  }

  async findAllReports(requester: UserPayload): Promise<IReport[]> {
    const authorityFilter = this.buildAuthorityFilter(requester);
    const { data } = await this.reportsRepository.findWithFilters({
      where: and(authorityFilter, isNull(schema.reports.deletedAt))!,
    });

    return data.map((report) => mapReportToIReport(report));
  }

  async findAllReportsPaginated(
    requester: UserPayload,
    filters: any,
  ): Promise<PaginatedList<IReport>> {
    const {
      page = 1,
      limit = 10,
      userId,
      name,
      startDate,
      endDate,
      status,
    } = filters;
    const offset = (page - 1) * limit;

    const authorityFilter = this.buildAuthorityFilter(requester);
    const queryFilters: SQL[] = [isNull(schema.reports.deletedAt)];

    if (userId) queryFilters.push(eq(schema.reports.userId, userId));
    if (name) queryFilters.push(ilike(schema.reports.name, `%${name}%`));
    if (status) queryFilters.push(eq(schema.reports.status, status as string));
    if (startDate)
      queryFilters.push(gte(schema.reports.startDate, new Date(startDate)));
    if (endDate)
      queryFilters.push(lte(schema.reports.endDate, new Date(endDate)));

    const { data, total } = await this.reportsRepository.findWithFilters({
      where: and(...queryFilters, authorityFilter)!,
      limit,
      offset,
      orderBy: desc(schema.reports.createdAt),
    });

    return {
      data: data.map((report) => mapReportToIReport(report)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(requester: UserPayload, reportId: string): Promise<IReport> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    const allowed = await this.reportsAuthorizationService.canViewReport(
      requester,
      report,
    );
    if (!allowed) throw new ReportUnauthorizedException();

    return mapReportToIReport(report);
  }

  async update(
    requester: UserPayload,
    reportId: string,
    dto: UpdateReportFieldsDto,
  ): Promise<IReport> {
    const updateData = this.prepareUpdateData(dto);

    const updated = await this.reportsRepository.updateWithCondition(
      reportId,
      updateData,
      and(
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.status, ReportStatus.CREATED),
        isNull(schema.reports.deletedAt),
      )!,
    );

    if (!updated) throw new ReportNotFoundException(reportId);
    return mapReportToIReport(updated);
  }

  async updateStatus(
    requester: UserPayload,
    reportId: string,
    dto: UpdateReportStatusDto,
  ): Promise<IReport> {
    const updated = await this.reportsRepository.updateWithCondition(
      reportId,
      { status: dto.status as string, updatedAt: new Date() },
      and(
        eq(schema.reports.status, ReportStatus.SUBMITTED),
        isNull(schema.reports.deletedAt),
      )!,
    );

    if (!updated)
      throw new ReportStatusConflictException(
        'Report not found or not in SUBMITTED state',
      );

    this.logger.log(
      `Report status updated: ${reportId} to ${dto.status} by user ${requester.id}`,
    );
    return mapReportToIReport(updated);
  }

  async submitReport(
    requester: UserPayload,
    reportId: string,
  ): Promise<IReport> {
    const updated = await this.reportsRepository.updateWithCondition(
      reportId,
      { status: ReportStatus.SUBMITTED, updatedAt: new Date() },
      and(
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.status, ReportStatus.CREATED),
        isNull(schema.reports.deletedAt),
      )!,
    );

    if (!updated)
      throw new ReportStatusConflictException(
        'Report not found or already submitted',
      );

    this.logger.log(`Report submitted: ${reportId} by user ${requester.id}`);
    return mapReportToIReport(updated);
  }

  async remove(requester: UserPayload, reportId: string) {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.userId !== requester.id)
      throw new ReportNotFoundException(reportId);
    if (report.status !== ReportStatus.CREATED)
      throw new ReportStatusConflictException(
        'Cannot remove a report after submission',
      );

    await this.reportsRepository.transaction(async (tx) => {
      await tx
        .update(schema.reports)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.reports.id, reportId));
      await tx
        .update(schema.tickets)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.tickets.reportId, reportId));
    });

    this.logger.log(
      `Report removed (soft-delete): ${reportId} by user ${requester.id}`,
    );
    return { deleted: true };
  }

  private buildAuthorityFilter(requester: UserPayload): SQL {
    const maxHierarchy = requester.roleHierarchy;
    const conditions: SQL[] = [];

    if (maxHierarchy >= AUTHORITY_LEVELS.GLOBAL) {
      conditions.push(isNull(schema.users.deletedAt));
    } else if (maxHierarchy >= AUTHORITY_LEVELS.COMPANY) {
      conditions.push(
        and(
          eq(schema.users.companyId, requester.companyId),
          isNull(schema.users.deletedAt),
        )!,
      );
    } else if (maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT) {
      conditions.push(
        and(
          eq(schema.users.companyId, requester.companyId),
          sql`EXISTS (SELECT 1 FROM ${schema.usersToDepartments} ud WHERE ud.user_id = ${schema.users.id} AND ud.department_id = ANY(${requester.departmentIds}::uuid[]))`,
          isNull(schema.users.deletedAt),
        )!,
      );
    } else {
      conditions.push(eq(schema.users.id, requester.id));
    }

    return or(eq(schema.users.id, requester.id), ...conditions)!;
  }

  private prepareUpdateData(
    dto: UpdateReportFieldsDto,
  ): Partial<schema.InsertReport> {
    const updateData: any = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.start_date !== undefined)
      updateData.startDate = new Date(dto.start_date);
    if (dto.end_date !== undefined) updateData.endDate = new Date(dto.end_date);
    if (dto.type !== undefined) updateData.type = dto.type;
    return updateData;
  }
}
