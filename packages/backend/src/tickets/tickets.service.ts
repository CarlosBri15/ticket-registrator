import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import {mapTicketToITicket} from './mapper/ticket.mapper';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketFieldsDto, UpdateTicketStatusDto } from './dto/update-ticket-user.dto';
import { ITicket, TicketStatus, ItemStatus, TicketLifecycle, ReportStatus } from '@ticket-registrator/shared';
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
      isVisible: true,
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot add ticket to non-created report');

    const imageBase64 = file.buffer.toString('base64');

    const [imageIdentifier, geminiData] = await Promise.all([
      this.storageService.uploadFile(file),
      this.geminiService.extractReceipt(imageBase64),
    ]);
    console.log(JSON.stringify(geminiData, null, 2));

    const itemsWithStatus = geminiData.items?.map(item => ({
      name: item.description ?? null,
      amount: item.price ?? null,
      currency: report.currency ?? null,
      status: ItemStatus.PENDING,
    })) ?? [];
    // --- SAFE DATE PARSING ---
    let parsedDate: Date | null = null;

    if (
      geminiData.date &&
      geminiData.date !== '0000-00-00'
    ) {
      const d = new Date(geminiData.date);

      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    };
    
    const ticket = await this.ticketModel.create({
      report_id: new Types.ObjectId(reportId),
      status: TicketStatus.PENDING,
      lifecycle: TicketLifecycle.DRAFT,
      cgs_bucket_link: imageIdentifier,
      items: itemsWithStatus,
      payment_type: geminiData.payment_method ?? null,
      expense_type: geminiData.expense_type ?? null,
      date: parsedDate,
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

    return mapTicketToITicket(ticket);
  }

  async findAll(userId: string, reportId: string): Promise<ITicket[]> {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true,
    });

    if (!report) throw new NotFoundException('Report not found');

    const tickets = await this.ticketModel.find({
      report_id: new Types.ObjectId(reportId),
      isVisible: true,
    });

    return tickets.map(ticket => mapTicketToITicket(ticket));
  }

  async findOne(userId: string, reportId: string, ticketId: string): Promise<ITicket> {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true,
    });

    if (!report) throw new NotFoundException('Report not found');

    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      report_id: new Types.ObjectId(reportId),
      isVisible: true,
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return mapTicketToITicket(ticket);
  }

  async update(userId: string, reportId: string, ticketId: string, dto: UpdateTicketFieldsDto): Promise<ITicket> {

    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true,
    });

    if (!report)
      throw new NotFoundException('Report not found');

    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot edit tickets after submission');

    const update: Partial<Ticket> = {};
    let meaningfulChange = false;

    if (dto.payment_type !== undefined) {
      update.payment_type = dto.payment_type;
      meaningfulChange = true;
    }

    if (dto.expense_type !== undefined) {
      update.expense_type = dto.expense_type;
      meaningfulChange = true;
    }

    if (dto.date !== undefined) {
      update.date = dto.date ? new Date(dto.date) : null;
      meaningfulChange = true;
    }

    if (dto.location_name !== undefined) {
      update.location_name = dto.location_name;
      meaningfulChange = true;
    }

    if (dto.location_address !== undefined) {
      update.location_address = dto.location_address;
      meaningfulChange = true;
    }

    if (dto.amount !== undefined) {
      update.amount = dto.amount;
      meaningfulChange = true;
    }

    if (dto.currency !== undefined) {
      update.currency = dto.currency;
      meaningfulChange = true;
    }

    if (dto.cgs_bucket_link_justification !== undefined) {
      update.cgs_bucket_link_justification = dto.cgs_bucket_link_justification;
    }

    if (dto.last_four_digits !== undefined) {
      update.last_four_digits = dto.last_four_digits;
    }

    if (dto.items !== undefined) {
      update.items = dto.items.map(item => ({
        ...item,
        status: ItemStatus.PENDING,
      }));
      meaningfulChange = true;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const updateQuery: any = {
      $set: update,
    };

    if (meaningfulChange) {
      updateQuery.$set.lifecycle = TicketLifecycle.SUBMITTED;
      updateQuery.$set.status = TicketStatus.PENDING;
      updateQuery.$set.approved_amount = 0;
      updateQuery.$inc = { version: 1 };
    }

    const updatedTicket = await this.ticketModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(ticketId),
        report_id: new Types.ObjectId(reportId),
        isVisible: true,
      },
      updateQuery,
      { new: true, runValidators: true },
    );

    if (!updatedTicket)
      throw new NotFoundException('Ticket not found');

    return mapTicketToITicket(updatedTicket);
  }

  async updateStatus(reportId: string, ticketId: string, dto: UpdateTicketStatusDto): Promise<ITicket> {
    const reportObjectId = new Types.ObjectId(reportId);
    const ticketObjectId = new Types.ObjectId(ticketId);

    // Ensure report is submitted
    const report = await this.reportModel.findOne({
      _id: reportObjectId,
      status: ReportStatus.SUBMITTED,
      isVisible: true,
    });

    if (!report) {
      throw new ConflictException(
        'Tickets can only be reviewed after report submission',
      );
    }

    // Only allowed fields
    const updateFields: Partial<Ticket> = {
      status: dto.status,
      approved_amount: dto.approved_amount,
    };

    const updatedTicket = await this.ticketModel.findOneAndUpdate(
      { _id: ticketObjectId, report_id: reportObjectId, isVisible: true },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    return mapTicketToITicket(updatedTicket);
  }

  // Make ticket invisible instead of deleting, only if report is still in CREATED status
  async remove(userId: string, reportId: string, ticketId: string) {
    const report = await this.reportModel.findOne({
      _id: new Types.ObjectId(reportId),
      user_id: new Types.ObjectId(userId),
      isVisible: true,
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot hide tickets after submission');
    }
    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(ticketId),
      report_id: new Types.ObjectId(reportId),
      isVisible: true,
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    ticket.isVisible = false;
    await ticket.save();

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
