import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket-user.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { ReportStatus } from '../reports/report-status/report-status';
import { ITicket, IItem, TicketStatus, ItemStatus, TicketLifecycle } from '@ticket-registrator/shared';
import { GeminiService } from 'src/gemini/gemini.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    private readonly geminiService: GeminiService,     
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, reportId: string, file: Express.Multer.File): Promise<ITicket> {
    const report = await this.reportModel.findOne({
      _id: reportId,
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot add ticket to non-created report');
    // Image to buffer to basse64 istring for Gemini
    const imageBase64 = file.buffer.toString('base64');
    
    // Parallelize image upload and Gemini extraction
    const [imageIdentifier, geminiData] = await Promise.all([
      this.storageService.uploadFile(file),         // Upload image
      this.geminiService.extractReceipt(imageBase64),
    ]);
    console.log('🧠 Gemini LLM response:', JSON.stringify(geminiData, null, 2));
    
    const itemsWithStatus = geminiData.items?.map(item => ({
      name: item.description ?? null,
      amount: item.price ?? 0,
      currency: report.currency ?? null,
      status: ItemStatus.PENDING,
    })) ?? [];

    const ticket = await this.ticketModel.create({
      report_id: new Types.ObjectId(reportId),
      status: TicketStatus.PENDING,
      lifecycle: TicketLifecycle.DRAFT,
      cgs_bucket_link: imageIdentifier,
      items: itemsWithStatus,
      payment_type: geminiData.payment_method ?? null,
      expense_type: geminiData.expense_type ?? null,
      date: geminiData.date ? new Date(geminiData.date) : null,
      location_name: geminiData.establishment ?? null,
      location_address: geminiData.address?.formatted_address ?? null,
      amount: geminiData.total ?? null,
      currency: report.currency ?? null,
      converted_amount: geminiData.converted_amount ?? null,
      converted_currency: geminiData.converted_currency ?? null,
      cgs_bucket_link_justification:
        geminiData.cgs_bucket_link_justification ?? null,
      last_four_digits: geminiData.card_last_4 ?? null,
    });

    const mapTicketToITicket = (ticketDoc): ITicket => ({
      id: ticketDoc._id.toString(),
      report_id: ticketDoc.report_id.toString(),
      status: ticketDoc.status,
      cgs_bucket_link: ticketDoc.cgs_bucket_link,
      payment_type: ticketDoc.payment_type,
      expense_type: ticketDoc.expense_type,
      date: ticketDoc.date,
      location_name: ticketDoc.location_name,
      location_address: ticketDoc.location_address,
      amount: ticketDoc.amount,
      currency: ticketDoc.currency,
      converted_amount: ticketDoc.converted_amount,
      converted_currency: ticketDoc.converted_currency,
      cgs_bucket_link_justification: ticketDoc.cgs_bucket_link_justification,
      last_four_digits: ticketDoc.last_four_digits,
      items: ticketDoc.items?.map((item): IItem => ({
        id: item._id?.toString() || '',
        name: item.name,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
      })) ?? [],
      createdAt: ticketDoc.createdAt,
      updatedAt: ticketDoc.updatedAt,
    });

    return mapTicketToITicket(ticket);
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
    // Verify report ownership & editable state
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot edit tickets after submission');
    }

    // Build allow-listed update dynamically
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

    // Single atomic DB update
    const updatedTicket = await this.ticketModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(ticketId),
        report_id: new Types.ObjectId(reportId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    // Recalculate report totals
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

    // Ensure report is submitted
    const report = await this.reportModel.findOne({
      _id: reportObjectId,
      status: ReportStatus.SUBMITTED,
    });

    if (!report) {
      throw new ConflictException('Tickets can only be reviewed after report submission');
    }

    //Atomic ticket update (only allowed fields)
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

    // Update report approved amount
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

  async getTicketImageUrl(userId: string, reportId: string, ticketId: string): Promise<{ url: string }> {
    const ticket = await this.findOne(userId, reportId, ticketId);
    
    if (!ticket.cgs_bucket_link) {
      throw new NotFoundException('No image found for this ticket');
    }

    const url = await this.storageService.findFile(ticket.cgs_bucket_link);
    return { url };
  }
}
