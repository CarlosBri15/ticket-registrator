import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket-user.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { ReportStatus } from '../reports/report-status/report-status';
import { ItemStatus } from './status/item-status';
import { TicketStatus } from './status/ticket-status';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(userId: string, reportId: string, dto: CreateTicketDto) {
    const report = await this.reportModel.findOne({
      _id: reportId,
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot add ticket to non-created report');

     // Set item statuses to pending (if items exist)
    const itemsWithStatus = dto.items?.map((item) => ({
      ...item,
      status: ItemStatus.PENDING,
    })) ?? [];

    const ticket = await this.ticketModel.create({
      ...dto,
      report_id: new Types.ObjectId(reportId),

      status: TicketStatus.PENDING,
      items: itemsWithStatus,
    });

    //await this.updateRequestedAmount(reportId);
    return ticket;
  }


  async findAll(userId: string, reportId: string) {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');

    return this.ticketModel.find({
      report_id: new Types.ObjectId(reportId),
    });
  }

  async findOne(userId: string, reportId: string, ticketId: string) {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');

    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      report_id: new Types.ObjectId(reportId),
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return ticket;
    }

  async update(
    userId: string,
    reportId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ) {
    // 1️⃣ Verify report ownership & editable state
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot edit tickets after submission');
    }

    // 2️⃣ Build allow-listed update dynamically
    const update: Partial<Ticket> = {};
    let invalidateApproval = false;

    if (dto.payment_type !== undefined) update.payment_type = dto.payment_type;
    if (dto.expense_type !== undefined) update.expense_type = dto.expense_type;
    if (dto.date !== undefined) {
      update.date = new Date(dto.date);
      invalidateApproval = true;
    }
    if (dto.location_name !== undefined) update.location_name = dto.location_name;
    if (dto.location_address !== undefined) update.location_address = dto.location_address;
    if (dto.amount !== undefined) {
      update.amount = dto.amount;
      invalidateApproval = true;
    }
    if (dto.currency !== undefined) {
      update.currency = dto.currency;
      invalidateApproval = true;
    }
    if (dto.cgs_bucket_link_justification !== undefined)
      update.cgs_bucket_link_justification = dto.cgs_bucket_link_justification;
    if (dto.last_four_digits !== undefined) update.last_four_digits = dto.last_four_digits;
    if (dto.items !== undefined) {
      update.items = dto.items.map(item => ({ ...item, status: ItemStatus.PENDING }));
      invalidateApproval = true;
    }

    // Any meaningful user edit invalidates ticket approval
    if (invalidateApproval) {
      update.status = TicketStatus.PENDING;
      update.approved_amount = 0;
    }

    // 3️⃣ Single atomic DB update
    const updatedTicket = await this.ticketModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(ticketId),
        report_id: new Types.ObjectId(reportId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    // 4️⃣ Recalculate report totals
    //await this.updateRequestedAmount(reportId);
    await this.updateApprovedAmount(reportId);

    return updatedTicket;
  }

  async updateStatus(
    reportId: string,
    ticketId: string,
    dto: UpdateTicketStatusDto,
  ) {
    const reportObjectId = new Types.ObjectId(reportId);
    const ticketObjectId = new Types.ObjectId(ticketId);

    // 1️⃣ Ensure report is submitted
    const report = await this.reportModel.findOne({
      _id: reportObjectId,
      status: ReportStatus.SUBMITTED,
    });

    if (!report) {
      throw new ConflictException('Tickets can only be reviewed after report submission');
    }

    // 2️⃣ Atomic ticket update (only allowed fields)
    const updateFields: Partial<Ticket> = {
      status: dto.status,
      approved_amount: dto.approved_amount,
    };

    const updatedTicket = await this.ticketModel.findOneAndUpdate(
      { _id: ticketObjectId, report_id: reportObjectId },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    // 3️⃣ Update report approved amount
    await this.updateApprovedAmount(reportId);

    return updatedTicket;
  }

  async remove(userId: string, reportId: string, ticketId: string) {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');

    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot delete tickets after submission');
    }

    const result = await this.ticketModel.deleteOne({
      _id: new Types.ObjectId(ticketId),
      report_id: new Types.ObjectId(reportId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Ticket not found');
    }

    await this.updateRequestedAmount(reportId);
    return { deleted: true };
  }

  private async updateRequestedAmount(reportId: string) {
    const sum = await this.ticketModel.aggregate([
      { $match: { report_id: new Types.ObjectId(reportId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    await this.reportModel.findByIdAndUpdate(reportId, {
      requested_amount: sum[0]?.total || 0,
    });
  }

  private async updateApprovedAmount(reportId: string) {
    const sum = await this.ticketModel.aggregate([
      { $match: { report_id: new Types.ObjectId(reportId) } },
      { $group: { _id: null, total: { $sum: '$approved_amount' } } },
    ]);

    await this.reportModel.findByIdAndUpdate(reportId, {
      approved_amount: sum[0]?.total || 0,
    });
  }
}
