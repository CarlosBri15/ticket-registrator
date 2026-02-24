import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { IReport, ReportStatus, ROLE_HIERARCHY, Roles } from '@ticket-registrator/shared';
import type { RoleType } from '@ticket-registrator/shared';
import type { PermissionType } from '@ticket-registrator/shared';
import { CreateReportDto } from './dto/create-report.dto';
import {UpdateReportFieldsDto, UpdateReportStatusDto} from './dto/update-report.dto'
import { mapReportToIReport } from './mapper/report.mapper';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,
    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>,
  ) {}

  // Helper to check if user exists and is visible
  private async getVisibleUser(id: string) {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      isVisible: true,
    });
    if (!user) throw new NotFoundException('User not found or not visible');
    return user;
  }

  async create(id: string, dto: CreateReportDto): Promise<IReport> {
    await this.getVisibleUser(id);  // Ensure user exists and is visible
    const overlapping = await this.reportModel.findOne({
      user_id: new Types.ObjectId(id),
      $or: [
        {
          start_date: { $lte: dto.end_date },
          end_date: { $gte: dto.start_date },
        },
      ],
    });

    if (overlapping) {
      throw new ConflictException(
        'A report already exists for this trip date range',
      );
    }

    // Create report
    const report = await this.reportModel.create({
      user_id: new Types.ObjectId(id),
      requested_amount: 0,
      approved_amount: 0,
      status: ReportStatus.CREATED,
      name:dto.name,
      start_date: dto.start_date,
      end_date: dto.end_date,
      currency: dto.currency,
      type: dto.type ?? '',
      isVisible: dto.isVisible,
    });

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

    // Ensure target user exists and is visible
    const targetUser = await this.getVisibleUser(targetUserId);
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    const targetHierarchy = ROLE_HIERARCHY[targetUser.role];

    //Permission checks
    // Own reports
    if (requester.id === targetUserId) {
      if (!requester.permissions.includes('view_own_reports')) {
        throw new ForbiddenException('You do not have permission to view your own reports');
      }
    }
    // Viewing others' reports
    else {
      let allowed = false;

      // Manager: can view reports of users in their department
      if (
        requester.role === Roles.MANAGER &&
        requester.permissions.includes('view_team_reports') &&
        targetUser.companyId.toString() === requester.companyId &&
        targetUser.departmentId?.toString() === requester.departmentId
      ) {
        allowed = true;
      }

      // Admin/SuperAdmin: can view reports in company, but only lower hierarchy
      if (
        (requester.role === Roles.ADMIN || requester.role === Roles.SUPERADMIN) &&
        requester.permissions.includes('view_all_reports') &&
        targetUser.companyId.toString() === requester.companyId &&
        targetHierarchy < requesterHierarchy
      ) {
        allowed = true;
      }

      if (!allowed) {
        throw new ForbiddenException('You do not have permission to view this user\'s reports');
      }
    }

    const reports = await this.reportModel.find({
      user_id: new Types.ObjectId(targetUserId),
      isVisible: true,
    });
    console.log('Reports found:', reports); // <-- add th
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
    const userFilter: any = {
      companyId: new Types.ObjectId(requester.companyId),
      isVisible: true,
    };

    //view all
    if (requester.permissions.includes("view_all_reports")) {

      if (requester.role !== Roles.SUPERADMIN) {
        userFilter.role = {
          $in: (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
            role => ROLE_HIERARCHY[role] < requesterHierarchy
          ),
        };
      }

    }
    //View Team
    else if (requester.permissions.includes("view_team_reports")) {
      userFilter.departmentId = new Types.ObjectId(requester.departmentId);
      userFilter.role = {
        $in: (Object.keys(ROLE_HIERARCHY) as RoleType[]).filter(
          role => ROLE_HIERARCHY[role] < requesterHierarchy
        ),
      };
    }

    // view own reports
    else {
      userFilter._id = new Types.ObjectId(requester.id);
    }

    const users = await this.userModel.find(userFilter).select('_id');
    let visibleUserIds = users.map(u => u._id.toString());

    if (!visibleUserIds.includes(requester.id)) {
      visibleUserIds.push(requester.id);
    }

    const reports = await this.reportModel.find({
      user_id: { $in: visibleUserIds.map(id => new Types.ObjectId(id)) },
      isVisible: true,
    });

    return reports.map(report => mapReportToIReport(report));
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
    const report = await this.reportModel.findById(reportId);
    if (!report || !report.isVisible) {
      throw new NotFoundException('Report not found');
    }

    const reportOwner = await this.getVisibleUser(report.user_id.toString());
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    const targetHierarchy = ROLE_HIERARCHY[reportOwner.role];
    if (reportOwner._id.toString() === requester.id) {
      if (!requester.permissions.includes('view_own_reports')) {
        throw new ForbiddenException('You do not have permission to view your own reports');
      }
      return mapReportToIReport(report);
    }

    // Manager: can view reports of users in their department
    if (
      requester.permissions.includes('view_team_reports') &&
      reportOwner.companyId.toString() === requester.companyId &&
      reportOwner.departmentId?.toString() === requester.departmentId
    ) {
      return mapReportToIReport(report);
    }

    // Admin/SuperAdmin: can view all reports in company, but not above hierarchy
    if (
      requester.permissions.includes('view_all_reports') &&
      reportOwner.companyId.toString() === requester.companyId &&
      targetHierarchy < requesterHierarchy // cannot view reports of higher/equal roles
    ) {
      return mapReportToIReport(report);
    }
    throw new ForbiddenException('You do not have permission to view this report');
  }

  async update(userId: string,reportId: string,updateReportDto: UpdateReportFieldsDto): Promise<IReport> {
    await this.getVisibleUser(userId);
    // Only allow updates if report is still in CREATED status
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true,
      status: ReportStatus.CREATED,
    });

    if (!report) {
      throw new NotFoundException(
        'Report not found or cannot be updated (status must be CREATED)',
      );
    }

    // Update allowed fields from DTO
    const allowedFields = ['name', 'start_date', 'end_date', 'type', 'isVisible'] as const;

    let hasUpdates = false;
    allowedFields.forEach(field => {
      if (updateReportDto[field] !== undefined) {
        (report as any)[field] = updateReportDto[field];
        hasUpdates = true;
      }
    });

    if (!hasUpdates) {
      throw new BadRequestException('No valid fields provided for update');
    }

    // Save changes
    await report.save();

    // Map to IReport using your mapper
    return mapReportToIReport(report);
  }

  async updateStatus(reportId: string, dto: UpdateReportStatusDto): Promise<IReport> {
    // Only reports with status SUBMITTED can be updated
    const updatedReport = await this.reportModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(reportId),
        status: ReportStatus.SUBMITTED,
        isVisible: true,
      },
      { $set: { status: dto.status } },
      { new: true, runValidators: true },
    );

    if (!updatedReport) {
      throw new ConflictException(
        'Report not found or cannot be reviewed (status must be SUBMITTED)',
      );
    }

    // Use mapper for consistent formatting
    return mapReportToIReport(updatedReport);
  }

  async submitReport(userId: string, reportId: string): Promise<IReport> {
    await this.getVisibleUser(userId);
    const updatedReport = await this.reportModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(reportId),
        user_id: new Types.ObjectId(userId),
        status: ReportStatus.CREATED,
        isVisible: true,
      },
      { $set: { status: ReportStatus.SUBMITTED } },
      { new: true, runValidators: true },
    );

    if (!updatedReport) {
      throw new ConflictException(
        'Report not found or cannot be submitted (status must be CREATED)',
      );
    }

    // Map Mongoose document to IReport using the mapper
    return mapReportToIReport(updatedReport);
  }

  async remove(userId: string, reportId: string) {
    await this.getVisibleUser(userId);
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot remove a report after submission');
    }
    report.isVisible = false;
    await report.save();
    // Cascade: hide all tickets belonging to this report
    await this.ticketModel.updateMany(
      { report_id: new Types.ObjectId(reportId) },
      { $set: { isVisible: false } }
    );
    return { deleted: true };
  }


}
