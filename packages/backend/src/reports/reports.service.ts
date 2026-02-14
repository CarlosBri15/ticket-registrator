import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { IReport, ReportStatus } from '@ticket-registrator/shared';
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
  private async getVisibleUser(userId: string) {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
      isVisible: true,
    });
    if (!user) throw new NotFoundException('User not found or not visible');
    return user;
  }

  async create(userId: string, dto: CreateReportDto): Promise<IReport> {
    await this.getVisibleUser(userId);  // Ensure user exists and is visible
    const overlapping = await this.reportModel.findOne({
      user_id: new Types.ObjectId(userId),
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
      user_id: new Types.ObjectId(userId),
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

  async findAll(userId: string): Promise<IReport[]> {
    await this.getVisibleUser(userId);  // Ensure user exists and is visible
    const reports = await this.reportModel.find({
      user_id: new Types.ObjectId(userId),
      isVisible: true,
    });

    return reports.map(report => mapReportToIReport(report));
  }

  async findOne(userId: string, reportId: string): Promise<IReport> {
    await this.getVisibleUser(userId);
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true, // optional: only show visible reports
    });

    if (!report) throw new NotFoundException('Report not found');

    return mapReportToIReport(report);
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
    // Instead of hard delete, mark report as invisible
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
