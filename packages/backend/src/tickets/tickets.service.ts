import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { mapTicketToITicket } from './mapper/ticket.mapper';
import { UpdateTicketFieldsDto, UpdateTicketStatusDto } from './dto/update-ticket-user.dto';
import { ITicket, TicketStatus, ItemStatus, TicketLifecycle, ReportStatus } from '@ticket-registrator/shared';
import type { RoleType, PermissionType } from '@ticket-registrator/shared';
import { GeminiService } from 'src/gemini/gemini.service';
import { StorageService } from 'src/storage/storage.service';

type Requester = {
  id: string;
  role: RoleType;
  companyId: string;
  departmentId: string;
  permissions: PermissionType[];
};

@Injectable()
export class TicketsService {
  constructor(
    @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
    private readonly geminiService: GeminiService,
    private readonly storageService: StorageService,
  ) { }

  async create(requester: Requester, reportId: string, file: Express.Multer.File): Promise<ITicket> {

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot add ticket to non-created report');

    const imageBase64 = file.buffer.toString('base64');

    const [imageIdentifier, geminiData] = await Promise.all([
      this.storageService.uploadFile(file),
      this.geminiService.extractReceipt(imageBase64),
    ]);
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

    const [ticket] = await this.db.insert(schema.tickets).values({
      reportId: reportId,
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
      cgsBucketLinkJustification: geminiData.cgs_bucket_link_justification ?? null,
      lastFourDigits: geminiData.card_last_4 ?? null,
    }).returning();

    if (itemsWithStatus.length > 0) {
      await this.db.insert(schema.items).values(
        itemsWithStatus.map(item => ({
          ...item,
          ticketId: ticket.id,
        }))
      );
    }

    (ticket as any).items = itemsWithStatus;
    return mapTicketToITicket(ticket as any);
  }

  async findAll(requester: Requester, reportId: string): Promise<ITicket[]> {
    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) throw new NotFoundException('Report not found');

    const ticketsList = await this.db.query.tickets.findMany({
      where: and(
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      ),
      with: { items: true }
    });

    return ticketsList.map(t => mapTicketToITicket(t as any));
  }

  async findOne(requester: Requester, reportId: string, ticketId: string): Promise<ITicket> {
    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) throw new NotFoundException('Report not found');

    const ticket = await this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      ),
      with: { items: true }
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return mapTicketToITicket(ticket as any);
  }

  async update(requester: Requester, reportId: string, ticketId: string, dto: UpdateTicketFieldsDto): Promise<ITicket> {

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED)
      throw new ConflictException('Cannot edit tickets after submission');

    const update: any = {};
    let meaningfulChange = false;

    if (dto.payment_type !== undefined) { update.paymentType = dto.payment_type; meaningfulChange = true; }
    if (dto.expense_type !== undefined) { update.expenseType = dto.expense_type; meaningfulChange = true; }
    if (dto.date !== undefined) { update.date = dto.date ? new Date(dto.date) : null; meaningfulChange = true; }
    if (dto.location_name !== undefined) { update.locationName = dto.location_name; meaningfulChange = true; }
    if (dto.location_address !== undefined) { update.locationAddress = dto.location_address; meaningfulChange = true; }
    if (dto.amount !== undefined) { update.amount = dto.amount; meaningfulChange = true; }
    if (dto.currency !== undefined) { update.currency = dto.currency; meaningfulChange = true; }
    if (dto.cgs_bucket_link_justification !== undefined) { update.cgsBucketLinkJustification = dto.cgs_bucket_link_justification; }
    if (dto.last_four_digits !== undefined) { update.lastFourDigits = dto.last_four_digits; }
    let updatedItemsData: any[] | undefined = undefined;
    if (dto.items !== undefined) {
      updatedItemsData = dto.items.map(item => ({
        name: item.name ?? null,
        amount: item.amount ?? null,
        currency: item.currency ?? null,
        status: ItemStatus.PENDING,
      }));
      meaningfulChange = true;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const currentTicket = await this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      )
    });

    if (!currentTicket) throw new NotFoundException('Ticket not found');

    const oldSnapshot: Record<string, any> = {};
    const newSnapshot: Record<string, any> = {};

    for (const key of Object.keys(update)) {
      // Key is camelCase now
      oldSnapshot[key] = (currentTicket as any)[key];
      newSnapshot[key] = update[key];
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

    update.updatedAt = new Date();

    // --- SAVE HISTORY ---
    await this.db.insert(schema.ticketHistories).values({
      ticketId: currentTicket.id,
      reportId: currentTicket.reportId,
      version: currentTicket.version,
      oldSnapshot: JSON.parse(JSON.stringify(oldSnapshot)),
      newSnapshot: JSON.parse(JSON.stringify(newSnapshot)),
    });

    const [updatedTicket] = await this.db.update(schema.tickets)
      .set(update)
      .where(and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      ))
      .returning();

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    if (updatedItemsData !== undefined) {
      await this.db.delete(schema.items).where(eq(schema.items.ticketId, ticketId));
      if (updatedItemsData.length > 0) {
        await this.db.insert(schema.items).values(
          updatedItemsData.map(item => ({
            ...item,
            ticketId: ticketId
          }))
        );
      }
      (updatedTicket as any).items = updatedItemsData;
    } else {
      // Re-fetch to get original items if they weren't updated
      const fetchedItems = await this.db.query.items.findMany({
        where: eq(schema.items.ticketId, ticketId)
      });
      (updatedTicket as any).items = fetchedItems;
    }

    return mapTicketToITicket(updatedTicket as any);
  }

  async updateStatus(requester: Requester, reportId: string, ticketId: string, dto: UpdateTicketStatusDto): Promise<ITicket> {

    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.status, ReportStatus.SUBMITTED),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) {
      throw new ConflictException(
        'Tickets can only be reviewed after report submission',
      );
    }

    const currentTicket = await this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      )
    });

    if (!currentTicket) {
      throw new NotFoundException('Ticket not found');
    }

    //snapshots for history
    const oldSnapshot = {
      status: currentTicket.status,
      approvedAmount: currentTicket.approvedAmount,
    };
    const newSnapshot = {
      status: dto.status,
      approvedAmount: dto.approved_amount, // dto still uses snake_case, map it to our snapshot
    };

    await this.db.insert(schema.ticketHistories).values({
      ticketId: currentTicket.id,
      reportId: currentTicket.reportId,
      version: currentTicket.version,
      oldSnapshot,
      newSnapshot,
    });

    const [updatedTicket] = await this.db.update(schema.tickets)
      .set({
        status: dto.status as any,
        approvedAmount: dto.approved_amount,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      ))
      .returning();

    if (!updatedTicket) throw new NotFoundException('Ticket not found');

    return mapTicketToITicket(updatedTicket as any);
  }

  // Make ticket invisible instead of deleting, only if report is still in CREATED status
  async remove(requester: Requester, reportId: string, ticketId: string) {
    const report = await this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.id, reportId),
        eq(schema.reports.userId, requester.id),
        eq(schema.reports.isVisible, true)
      )
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.CREATED) {
      throw new ConflictException('Cannot hide tickets after submission');
    }

    const ticket = await this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.id, ticketId),
        eq(schema.tickets.reportId, reportId),
        eq(schema.tickets.isVisible, true)
      )
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const oldSnapshot = { isVisible: ticket.isVisible };
    const newSnapshot = { isVisible: false };

    await this.db.insert(schema.ticketHistories).values({
      ticketId: ticket.id,
      reportId: ticket.reportId,
      version: ticket.version,
      oldSnapshot,
      newSnapshot,
    });

    await this.db.update(schema.tickets)
      .set({
        isVisible: false,
        version: ticket.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(schema.tickets.id, ticket.id));

    return { deleted: true };
  }

  async getTicketImageUrl(requester: Requester, reportId: string, ticketId: string): Promise<{ url: string }> {
    const ticket = await this.findOne(requester, reportId, ticketId);

    if (!ticket.cgs_bucket_link) {
      throw new NotFoundException('No image found for this ticket');
    }

    const url = await this.storageService.findFile(ticket.cgs_bucket_link);
    return { url };
  }
}
