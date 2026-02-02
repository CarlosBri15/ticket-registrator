import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import {UpdateReportFieldsDto, UpdateReportStatusDto} from './dto/update-report.dto';
import { ReportStatus } from './report-status/report-status';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,
    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>,
  ) {}

  async create(userId: string, dto: CreateReportDto) {
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

    const report = new this.reportModel({
        ...dto,
        user_id: new Types.ObjectId(userId),
        requested_amount: 0,
        approved_amount: 0,
        status: ReportStatus.CREATED,
    });

    return report.save();
    }

  async findAll(userId: string) {
    return this.reportModel
      .find({ user_id: new Types.ObjectId(userId) });
  }

  async findOne(userId: string, reportId: string) {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async update(
    userId: string,
    reportId: string,
    updateReportDto: UpdateReportFieldsDto,
  ) {
    // ✅ Allowed fields from the DTO
    const allowedFields = ['name', 'start_date', 'end_date', 'type'];

    // ✅ Keys present in the request body
    const bodyKeys = Object.keys(updateReportDto);

    // 1️⃣ Check for invalid fields
    const invalidFields = bodyKeys.filter(
      key => !allowedFields.includes(key) && key !== 'reportId',
    );

    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Invalid fields provided: ${invalidFields.join(', ')}`,
      );
    }

    // 2️⃣ Build the update object dynamically
    const updateFields: Record<string, any> = {};

    if (updateReportDto.name !== undefined) updateFields.name = updateReportDto.name;
    if (updateReportDto.start_date !== undefined)
      updateFields.start_date = new Date(updateReportDto.start_date);
    if (updateReportDto.end_date !== undefined)
      updateFields.end_date = new Date(updateReportDto.end_date);
    if (updateReportDto.type !== undefined) updateFields.type = updateReportDto.type;

    // 3️⃣ If no valid fields are provided
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    // 4️⃣ Perform the update in the DB
    const updatedReport = await this.reportModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(reportId),
        user_id: new Types.ObjectId(userId), // ensures ownership
      },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedReport) {
      throw new NotFoundException(
        'Report not found or you do not have permission',
      );
    }

    return updatedReport;
  }


  async submitReport(userId: string, reportId: string) {
  const updatedReport = await this.reportModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      status: ReportStatus.CREATED, // Make sure it matches the enum exactly
    },
    { $set: { status: ReportStatus.SUBMITTED } },
    { new: true, runValidators: true }
  );

  if (!updatedReport) {
    throw new ConflictException(
      'Report not found or cannot be submitted (status must be CREATED)'
    );
  }

  return updatedReport;
}

  async updateStatus(reportId: string, dto: UpdateReportStatusDto) {
    // Only submitted reports can be reviewed
    const updatedReport = await this.reportModel.findOneAndUpdate(
      { _id: reportId, status: ReportStatus.SUBMITTED },
      { $set: { status: dto.status } },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      throw new ConflictException(
        'Report not found or cannot be reviewed (status must be SUBMITTED)'
      );
    }

    return updatedReport;
  }

  async remove(userId: string, reportId: string) {
    // Delete the report in a single call if owned by the user
    const report = await this.reportModel.findOneAndDelete({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');

    // Cascade delete tickets
    await this.ticketModel.deleteMany({
      report_id: new Types.ObjectId(reportId),
    });

    return { deleted: true };
  }

}
