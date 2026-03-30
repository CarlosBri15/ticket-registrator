import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
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
  ) { }

  async create(
    requester: UserPayload,
    reportId: string,
    file: Express.Multer.File,
    language?: string,
  ): Promise<ITicket> {
    const report = await this.getReportOrThrow(reportId);

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
    const isImage = file.mimetype?.startsWith('image/') ?? false;
    let imageHash: string | null = null;

    if (isImage) {
      imageHash = await this.cryptoService.generatePerceptualHash(file.buffer);

      // Fraud prevention: Check for similar images in the entire DB
      const existingFingerprints =
        await this.ticketsRepository.findAllFingerprints();

      for (const entry of existingFingerprints) {
        if (!entry.imageId || !imageHash) continue;

        const [oldHash, oldRatioStr] = entry.imageId.split('|');
        const [newHash, newRatioStr] = imageHash.split('|');

        if (oldRatioStr && newRatioStr) {
          // New format: Check aspect ratio first (tolerance 5%)
          if (
            Math.abs(parseFloat(oldRatioStr) - parseFloat(newRatioStr)) > 0.05
          )
            continue;

          const distance = this.cryptoService.calculateHammingDistance(
            newHash,
            oldHash,
          );

          // Hamming distance threshold for 24x24 (576 bits):
          // 20 matches (approx 3% difference) is used as a fast, conservative check for nearly-identical images.
          // We rely on the subsequent Semantic Check (Date/Amount/Location) to catch duplicates
          // with different angles or minor visual variations, avoiding false positive collisions.
          if (distance === 0) {
            throw new DuplicateTicketException(
              `This receipt has already been processed (Similarity match)`,
            );
          }
        } else {
          // Legacy fallback: only block if exactly identical for different versions
          const distance = this.cryptoService.calculateHammingDistance(
            newHash,
            oldHash,
          );
          if (distance === 0) {
            throw new DuplicateTicketException(
              `This receipt has already been processed (Exact match)`,
            );
          }
        }
      }
    }

    const geminiData = await this.geminiService.extractReceipt(
      imageBase64,
      requester.companyId,
      file.mimetype || 'image/jpeg',
      language,
    );

    let parsedDate: Date | null = null;
    if (geminiData.date && geminiData.date !== '0000-00-00') {
      const d = new Date(geminiData.date);
      if (!Number.isNaN(d.getTime())) parsedDate = d;
    }

    // 1. Report Date Boundary Validation
    if (parsedDate) {
      if (parsedDate < report.startDate || parsedDate > report.endDate) {
        geminiData.flag = true;
        const startStr = report.startDate.toISOString().split('T')[0];
        const endStr = report.endDate.toISOString().split('T')[0];
        const dateStr =
          geminiData.date || parsedDate.toISOString().split('T')[0];
        const message = `Receipt date (${dateStr}) is outside report range (${startStr} to ${endStr}).`;

        geminiData.llm_comment = geminiData.llm_comment
          ? `${geminiData.llm_comment} / ${message}`
          : message;
      }
    }

    // 2. Semantic Duplicate Check
    if (
      parsedDate &&
      geminiData.total != null &&
      geminiData.establishment != null
    ) {
      const isDuplicate = await this.ticketsRepository.findSemanticDuplicate(
        parsedDate,
        geminiData.total,
        geminiData.establishment,
      );

      if (isDuplicate) {
        throw new DuplicateTicketException(
          'This receipt has already been processed based on its extracted data.',
        );
      }
    }

    // 3. Image Compression & Storage
    let uploadFile = file;

    if (isImage) {
      // Compress to WebP (quality 60) and resize (max 1000px width) to save storage.
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 60 })
        .toBuffer();

      // Update file object for upload
      const originalName = file.originalname.split('.')[0];
      uploadFile = {
        ...file,
        buffer: compressedBuffer,
        mimetype: 'image/webp',
        originalname: `${originalName}.webp`,
      } as Express.Multer.File;
    }

    const imageIdentifier = await this.storageService.uploadFile(uploadFile);

    const items: InsertItem[] =
      geminiData.items?.map((item) => ({
        ticketId: '',
        name: item.description ?? null,
        amount: item.price ?? null,
        currency: report.currency ?? null,
        categoryId: item.categoryId ?? null,
        status: ItemStatus.PENDING,
      })) ?? [];

    const ticketData: InsertTicket = {
      reportId,
      status: TicketStatus.PENDING,
      lifecycle: TicketLifecycle.DRAFT,
      cgsBucketLink: imageIdentifier,
      paymentType: geminiData.payment_method ?? null,
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
    if (fullTicket?.reportId !== reportId) throw new TicketNotFoundException(ticket.id);
    return mapTicketToITicket(fullTicket);
  }

  async findAll(requester: UserPayload, reportId: string): Promise<ITicket[]> {
    const report = await this.getReportOrThrow(reportId);

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
    const report = await this.getReportOrThrow(reportId);

    if (
      !(await this.ticketsAuthService.validateCanViewReport(requester, report))
    ) {
      throw new TicketUnauthorizedException();
    }

    const ticket = (await this.ticketsRepository.findById(ticketId)) as
      | (Ticket & { items: Item[] })
      | undefined;
    if (ticket?.reportId !== reportId)
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
    const report = await this.getReportOrThrow(reportId);

    if (report.status !== ReportStatus.SUBMITTED) {
      throw new TicketStatusConflictException(
        'Tickets can only be reviewed after report submission',
      );
    }

    const currentTicket = await this.ticketsRepository.findById(ticketId);
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
    const { currentTicket: ticket } = await this.getValidatedReportAndTicket(
      requester,
      reportId,
      ticketId,
      'hide',
    );

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

  async hardDelete(requester: UserPayload, reportId: string, ticketId: string) {
    const { currentTicket: ticket } = await this.getValidatedReportAndTicket(
      requester,
      reportId,
      ticketId,
      'hard delete',
    );

    // Delete from GCS first
    if (ticket.cgsBucketLink) {
      try {
        await this.storageService.removeFile(ticket.cgsBucketLink);
      } catch (error) {
        this.logger.error(
          `Failed to delete GCS file ${ticket.cgsBucketLink} during hard delete of ticket ${ticketId}`,
          error,
        );
        // We continue with DB deletion even if GCS fail (optional strategy)
        // Or we could rethrow if we want strict consistency.
        // User asked to "fully delete", so we aim for both.
      }
    }

    await this.ticketsRepository.hardDelete(ticketId);

    this.logger.log(`Ticket hard deleted: ${ticketId} by user ${requester.id}`);
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

  private async getReportOrThrow(reportId: string): Promise<ReportEntity> {
    const report = await this.reportsRepository.findById(reportId);
    if (!report || report.deletedAt)
      throw new ReportNotFoundException(reportId);
    return report;
  }

  private async getValidatedReportAndTicket(
    requester: UserPayload,
    reportId: string,
    ticketId: string,
    actionDesc: string = 'edit',
  ): Promise<{ report: ReportEntity; currentTicket: Ticket }> {
    const report = await this.getReportOrThrow(reportId);

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
        `Cannot ${actionDesc} tickets after report submission`,
      );
    }

    const currentTicket = await this.ticketsRepository.findById(ticketId);
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
        const up = update as Record<string, unknown>;
        up[mapping.updateKey] = dto[mapping.dtoKey];
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
        categoryId: item.categoryId ?? null,
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

    const oldSnap = oldSnapshot as Record<string, unknown>;
    const newSnap = newSnapshot as Record<string, unknown>;
    const curr = currentTicket as Record<string, unknown>;
    const upd = update as Record<string, unknown>;

    for (const key of Object.keys(update)) {
      oldSnap[key] = curr[key];
      newSnap[key] = upd[key];
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
