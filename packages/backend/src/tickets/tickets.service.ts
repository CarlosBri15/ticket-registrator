import { Injectable, Logger, ConflictException } from '@nestjs/common';
import {
  ITicket,
  TicketStatus,
  TicketLifecycle,
  ReportStatus,
  ItemStatus,
  IReceiptExtraction,
} from '@ticket-registrator/shared';
import { TicketsRepository } from './tickets.repository';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { ReportsRepository } from '../reports/reports.repository';
import { GeminiService } from '../gemini/gemini.service';
import { StorageService } from '../storage/storage.service';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { mapTicketToITicket } from './mapper/ticket.mapper';
import {
  TicketNotFoundException,
  TicketUnauthorizedException,
  TicketStatusConflictException,
} from './exceptions/tickets.exceptions';
import { ReportNotFoundException } from '../reports/exceptions/reports.exceptions';
import {
  UpdateTicketFieldsDto,
  UpdateTicketStatusDto,
} from './dto/update-ticket-user.dto';
import * as schema from '../db/schema';
import { Ticket, InsertTicket } from './schemas/ticket.schema';
import { InsertItem, Item } from '../items/schemas/item.schema';
import { Report } from '../reports/schemas/report.schema';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly reportsRepository: ReportsRepository,
    private readonly ticketsAuthService: TicketsAuthorizationService,
    private readonly geminiService: GeminiService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    requester: UserPayload,
    reportId: string,
    file: Express.Multer.File,
  ): Promise<ITicket> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(await this.ticketsAuthService.validateCanModifyReport(
        requester,
        report,
      ))
    ) {
      throw new TicketUnauthorizedException(
        'You can only add tickets to your own reports',
      );
    }

    if (report.status !== ReportStatus.CREATED) {
      throw new TicketStatusConflictException(
        'Cannot add tickets to a report that is not in CREATED status',
      );
    }

    const imageBase64 = file.buffer.toString('base64');
    const [imageIdentifier, geminiData] = await Promise.all([
      this.storageService.uploadFile(file),
      this.geminiService.extractReceipt(imageBase64),
    ]);

    const items: InsertItem[] =
      geminiData.items?.map((item) => ({
        ticketId: '', // Will be set by repository
        name: item.description ?? null,
        amount: item.price ?? null,
        currency: report.currency ?? null,
        status: ItemStatus.PENDING,
      })) ?? [];

    let parsedDate: Date | null = null;
    if (geminiData.date && geminiData.date !== '0000-00-00') {
      const d = new Date(geminiData.date);
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    const ticketData: InsertTicket = {
      reportId,
      status: TicketStatus.PENDING,
      lifecycle: TicketLifecycle.DRAFT,
      cgsBucketLink: imageIdentifier,
      paymentType: geminiData.payment_method ?? null,
      expenseType: geminiData.expense_type ?? null,
      date: parsedDate,
      locationName: geminiData.establishment ?? null,
      locationAddress: geminiData.address?.formatted_address ?? null,
      amount: geminiData.total ?? null,
      currency: report.currency ?? null,
      convertedAmount: geminiData.converted_amount ?? null,
      convertedCurrency: geminiData.converted_currency ?? null,
      cgsBucketLinkJustification:
        geminiData.cgs_bucket_link_justification ?? null,
      lastFourDigits: geminiData.card_last_4 ?? null,
      version: 1,
    };

    const ticket = await this.ticketsRepository.create(ticketData, items);

    this.logger.log(
      `Ticket created: ${ticket.id} in report ${reportId} by user ${requester.id}`,
    );

    // We need to fetch it again or map it manually with items since create returns the ticket
    const fullTicket = (await this.ticketsRepository.findById(ticket.id)) as
      | (Ticket & { items: Item[] })
      | undefined;
    if (!fullTicket) throw new TicketNotFoundException(ticket.id);
    return mapTicketToITicket(fullTicket);
  }

  async findAll(requester: UserPayload, reportId: string): Promise<ITicket[]> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(await this.ticketsAuthService.validateCanViewReport(requester, report))
    ) {
      throw new TicketUnauthorizedException();
    }

    const tickets = await this.ticketsRepository.findByReportId(reportId);
    return tickets.map((t) => mapTicketToITicket(t as any)); // findByReportId uses 'with', mapping is fine
  }

  async findOne(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
  ): Promise<ITicket> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(await this.ticketsAuthService.validateCanViewReport(requester, report))
    ) {
      throw new TicketUnauthorizedException();
    }

    const ticket = (await this.ticketsRepository.findById(ticketId)) as
      | (Ticket & { items: Item[] })
      | undefined;
    if (!ticket || ticket.reportId !== reportId)
      throw new TicketNotFoundException(ticketId);

    return mapTicketToITicket(ticket);
  }

  async update(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
    dto: UpdateTicketFieldsDto,
  ): Promise<ITicket> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(await this.ticketsAuthService.validateCanModifyReport(
        requester,
        report,
      ))
    ) {
      throw new TicketUnauthorizedException();
    }

    if (report.status !== ReportStatus.CREATED) {
      throw new TicketStatusConflictException(
        'Cannot edit tickets after report submission',
      );
    }

    const currentTicket = (await this.ticketsRepository.findById(ticketId)) as
      | Ticket
      | undefined;
    if (!currentTicket || currentTicket.reportId !== reportId)
      throw new TicketNotFoundException(ticketId);

    const update: Partial<InsertTicket> = {};
    let meaningfulChange = false;

    // Mapping fields with type safety
    if (dto.payment_type !== undefined) {
      update.paymentType = dto.payment_type;
      meaningfulChange = true;
    }
    if (dto.expense_type !== undefined) {
      update.expenseType = dto.expense_type;
      meaningfulChange = true;
    }
    if (dto.location_name !== undefined) {
      update.locationName = dto.location_name;
      meaningfulChange = true;
    }
    if (dto.location_address !== undefined) {
      update.locationAddress = dto.location_address;
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
      update.cgsBucketLinkJustification = dto.cgs_bucket_link_justification;
    }
    if (dto.last_four_digits !== undefined) {
      update.lastFourDigits = dto.last_four_digits;
    }

    if (dto.date !== undefined) {
      update.date = dto.date ? new Date(dto.date) : null;
      meaningfulChange = true;
    }

    let updatedItemsData: InsertItem[] | undefined = undefined;
    if (dto.items !== undefined) {
      updatedItemsData = dto.items.map((item) => ({
        ticketId,
        name: item.name ?? null,
        amount: item.amount ?? null,
        currency: item.currency ?? null,
        status: ItemStatus.PENDING,
      }));
      meaningfulChange = true;
    }

    if (Object.keys(update).length === 0 && updatedItemsData === undefined) {
      return this.findOne(requester, reportId, ticketId);
    }

    const oldSnapshot: Partial<InsertTicket> = {};
    const newSnapshot: Partial<InsertTicket> = {};

    for (const key of Object.keys(update)) {
      (oldSnapshot as any)[key] = (currentTicket as any)[key];
      (newSnapshot as any)[key] = (update as any)[key];
    }

    if (meaningfulChange) {
      oldSnapshot.lifecycle = currentTicket.lifecycle;
      oldSnapshot.status = currentTicket.status;
      oldSnapshot.approvedAmount = currentTicket.approvedAmount;

      newSnapshot.lifecycle = TicketLifecycle.SUBMITTED;
      newSnapshot.status = TicketStatus.PENDING;
      newSnapshot.approvedAmount = 0;

      update.lifecycle = TicketLifecycle.SUBMITTED;
      update.status = TicketStatus.PENDING;
      update.approvedAmount = 0;
      update.version = currentTicket.version + 1;
    }

    const historyData: typeof schema.ticketHistories.$inferInsert = {
      ticketId,
      reportId,
      version: currentTicket.version,
      oldSnapshot: JSON.parse(JSON.stringify(oldSnapshot)),
      newSnapshot: JSON.parse(JSON.stringify(newSnapshot)),
    };

    await this.ticketsRepository.updateWithHistory(
      ticketId,
      update,
      historyData,
      updatedItemsData,
    );

    this.logger.log(`Ticket updated: ${ticketId} by user ${requester.id}`);

    // Refresh to get items
    return this.findOne(requester, reportId, ticketId);
  }

  async updateStatus(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
    dto: UpdateTicketStatusDto,
  ): Promise<ITicket> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (report.status !== ReportStatus.SUBMITTED) {
      throw new TicketStatusConflictException(
        'Tickets can only be reviewed after report submission',
      );
    }

    const currentTicket = (await this.ticketsRepository.findById(ticketId)) as
      | Ticket
      | undefined;
    if (!currentTicket || currentTicket.reportId !== reportId)
      throw new TicketNotFoundException(ticketId);

    const oldSnapshot = {
      status: currentTicket.status,
      approvedAmount: currentTicket.approvedAmount,
    };
    const newSnapshot = {
      status: dto.status,
      approvedAmount: dto.approved_amount,
    };

    const historyData: typeof schema.ticketHistories.$inferInsert = {
      ticketId,
      reportId,
      version: currentTicket.version,
      oldSnapshot: JSON.parse(JSON.stringify(oldSnapshot)),
      newSnapshot: JSON.parse(JSON.stringify(newSnapshot)),
    };

    await this.ticketsRepository.updateWithHistory(
      ticketId,
      {
        status: dto.status,
        approvedAmount: dto.approved_amount,
        version: currentTicket.version + 1,
      },
      historyData,
    );

    this.logger.log(
      `Ticket status updated: ${ticketId} to ${dto.status} by user ${requester.id}`,
    );
    return this.findOne(requester, reportId, ticketId);
  }

  async remove(requester: UserPayload, reportId: string, ticketId: string) {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(await this.ticketsAuthService.validateCanModifyReport(
        requester,
        report,
      ))
    ) {
      throw new TicketUnauthorizedException();
    }

    if (report.status !== ReportStatus.CREATED) {
      throw new TicketStatusConflictException(
        'Cannot hide tickets after submission',
      );
    }

    const ticket = (await this.ticketsRepository.findById(ticketId)) as
      | Ticket
      | undefined;
    if (!ticket || ticket.reportId !== reportId)
      throw new TicketNotFoundException(ticketId);

    const historyData: typeof schema.ticketHistories.$inferInsert = {
      ticketId,
      reportId,
      version: ticket.version,
      oldSnapshot: { deletedAt: null },
      newSnapshot: { deletedAt: new Date() },
    };

    await this.ticketsRepository.softDelete(ticketId, historyData);

    this.logger.log(`Ticket removed: ${ticketId} by user ${requester.id}`);
    return { deleted: true };
  }

  async getTicketImageUrl(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
  ): Promise<{ url: string }> {
    const ticket = await this.findOne(requester, reportId, ticketId);
    if (!ticket.cgs_bucket_link)
      throw new TicketNotFoundException('No image link found');

    const url = await this.storageService.findFile(ticket.cgs_bucket_link);
    return { url };
  }
}
