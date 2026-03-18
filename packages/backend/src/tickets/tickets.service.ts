import { Injectable, Logger } from '@nestjs/common';
import {
  ITicket,
  TicketStatus,
  TicketLifecycle,
  ReportStatus,
  ItemStatus,
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
  DuplicateTicketException,
} from './exceptions/tickets.exceptions';
import { CryptoService } from '../crypto/crypto.service';
import { ReportNotFoundException } from '../reports/exceptions/reports.exceptions';
import {
  UpdateTicketFieldsDto,
  UpdateTicketStatusDto,
} from './dto/update-ticket-user.dto';
import * as schema from '../db/schema';
import { Ticket, InsertTicket } from './schemas/ticket.schema';
import { InsertItem, Item } from '../items/schemas/item.schema';
import { Report as ReportEntity } from '../reports/schemas/report.schema';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly reportsRepository: ReportsRepository,
    private readonly ticketsAuthService: TicketsAuthorizationService,
    private readonly geminiService: GeminiService,
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(
    requester: UserPayload,
    reportId: string,
    file: Express.Multer.File,
    language?: string,
  ): Promise<ITicket> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !(this.ticketsAuthService.validateCanModifyReport(
        requester,
        report
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
    const imageHash = await this.cryptoService.generatePerceptualHash(
      file.buffer,
    );

    // Fraud prevention: Check for similar images in the entire DB
    const existingFingerprints =
      await this.ticketsRepository.findAllFingerprints();

    for (const entry of existingFingerprints) {
      if (!entry.imageId) continue;

      const [oldHash, oldRatioStr] = entry.imageId.split('|');
      const [newHash, newRatioStr] = imageHash.split('|');

      if (oldRatioStr && newRatioStr) {
        // New format: Check aspect ratio first (tolerance 5%)
        if (Math.abs(parseFloat(oldRatioStr) - parseFloat(newRatioStr)) > 0.05)
          continue;

        const distance = this.cryptoService.calculateHammingDistance(
          newHash,
          oldHash,
        );

        // Hamming distance threshold for 24x24 (576 bits):
        // 15 matches (approx 2.6% difference) is extremely safe.
        if (distance <= 15) {
          throw new DuplicateTicketException(
            `This receipt has already been processed (Similarity match: ${distance})`,
          );
        }
      } else {
        // Legacy fallback: only block if exactly identical for different versions
        const distance = this.cryptoService.calculateHammingDistance(
          newHash,
          oldHash,
        );
        if (distance <= 2) {
          throw new DuplicateTicketException(
            `This receipt has already been processed (Similarity match: ${distance})`,
          );
        }
      }
    }

    const [imageIdentifier, geminiData] = await Promise.all([
      this.storageService.uploadFile(file),
      this.geminiService.extractReceipt(imageBase64, language),
    ]);

    const items: InsertItem[] =
      geminiData.items?.map((item) => ({
        ticketId: '',
        name: item.description ?? null,
        amount: item.price ?? null,
        currency: report.currency ?? null,
        status: ItemStatus.PENDING,
      })) ?? [];

    let parsedDate: Date | null = null;
    if (geminiData.date && geminiData.date !== '0000-00-00') {
      const d = new Date(geminiData.date);
      if (!Number.isNaN(d.getTime())) parsedDate = d;
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
      flag: geminiData.flag ?? false,
      llmComment: geminiData.llm_comment ?? null,
      imageId: imageHash,
      version: 1,
    };

    const ticket = await this.ticketsRepository.create(ticketData, items);

    this.logger.log(
      `Ticket created: ${ticket.id} in report ${reportId} by user ${requester.id}`,
    );

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
    return tickets.map((t) => mapTicketToITicket(t));
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
    const { currentTicket } = await this.getValidatedReportAndTicket(
      requester,
      reportId,
      ticketId,
    );

    const { update, updatedItemsData, meaningfulChange } = this.mapDtoToUpdate(
      dto,
      ticketId,
    );

    if (Object.keys(update).length === 0 && updatedItemsData === undefined) {
      return this.findOne(requester, reportId, ticketId);
    }

    const { update: finalUpdate, historyData } = this.prepareUpdateData(
      currentTicket,
      update,
      meaningfulChange,
    );

    await this.ticketsRepository.updateWithHistory(
      ticketId,
      finalUpdate,
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
    if (currentTicket?.reportId !== reportId)
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
      oldSnapshot: structuredClone(oldSnapshot),
      newSnapshot: structuredClone(newSnapshot),
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
      !(this.ticketsAuthService.validateCanModifyReport(
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
    if (ticket?.reportId !== reportId)
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

  private async getValidatedReportAndTicket(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
  ): Promise<{ report: ReportEntity; currentTicket: Ticket }> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);

    if (
      !this.ticketsAuthService.validateCanModifyReport(
        requester, // Fixed missing await-non-promise
        report,
      )
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
    if (currentTicket?.reportId !== reportId)
      throw new TicketNotFoundException(ticketId);

    return { report, currentTicket };
  }

  private mapDtoToUpdate(dto: UpdateTicketFieldsDto, ticketId: string) {
    const update: Partial<InsertTicket> = {};
    let meaningfulChange = false;

    const fieldsMapping: Array<{
      dtoKey: keyof UpdateTicketFieldsDto;
      updateKey: keyof InsertTicket;
      meaningful: boolean;
    }> = [
      { dtoKey: 'payment_type', updateKey: 'paymentType', meaningful: true },
      { dtoKey: 'expense_type', updateKey: 'expenseType', meaningful: true },
      { dtoKey: 'location_name', updateKey: 'locationName', meaningful: true },
      {
        dtoKey: 'location_address',
        updateKey: 'locationAddress',
        meaningful: true,
      },
      { dtoKey: 'amount', updateKey: 'amount', meaningful: true },
      { dtoKey: 'currency', updateKey: 'currency', meaningful: true },
      {
        dtoKey: 'cgs_bucket_link_justification',
        updateKey: 'cgsBucketLinkJustification',
        meaningful: false,
      },
      {
        dtoKey: 'last_four_digits',
        updateKey: 'lastFourDigits',
        meaningful: false,
      },
    ];

    for (const mapping of fieldsMapping) {
      if (dto[mapping.dtoKey] !== undefined) {
        (update as any)[mapping.updateKey] = dto[mapping.dtoKey];
        if (mapping.meaningful) meaningfulChange = true;
      }
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

    return { update, updatedItemsData, meaningfulChange };
  }

  private prepareUpdateData(
    currentTicket: Ticket,
    update: Partial<InsertTicket>,
    meaningfulChange: boolean,
  ) {
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
      ticketId: currentTicket.id,
      reportId: currentTicket.reportId,
      version: currentTicket.version,
      oldSnapshot: structuredClone(oldSnapshot),
      newSnapshot: structuredClone(newSnapshot),
    };

    return { update, historyData };
  }
}
