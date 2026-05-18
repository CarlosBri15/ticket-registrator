import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

@Injectable()
export class TicketsRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    return this.db.query.tickets.findFirst({
      where: and(eq(schema.tickets.id, id), isNull(schema.tickets.deletedAt)),
      // Stable item order (insertion order) — without an explicit ORDER BY,
      // Postgres may reshuffle a row after `UPDATE`, which surfaced as items
      // jumping to the bottom of the list after the supervisor approved/
      // rejected them.
      with: {
        items: {
          with: { category: true },
          orderBy: (items, { asc }) => [asc(items.createdAt), asc(items.id)],
        },
      },
    });
  }

  async findByReportId(reportId: string) {
    return this.db.query.tickets.findMany({
      where: and(
        eq(schema.tickets.reportId, reportId),
        isNull(schema.tickets.deletedAt),
      ),
      with: {
        items: {
          with: { category: true },
          orderBy: (items, { asc }) => [asc(items.createdAt), asc(items.id)],
        },
      },
      orderBy: [desc(schema.tickets.createdAt)],
    });
  }

  async findByImageId(imageId: string) {
    return this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.imageId, imageId),
        isNull(schema.tickets.deletedAt),
      ),
    });
  }

  async findAllFingerprints() {
    return this.db.query.tickets.findMany({
      where: isNull(schema.tickets.deletedAt),
      columns: {
        id: true,
        imageId: true,
      },
    });
  }

  async findSemanticDuplicate(
    date: Date,
    amount: number,
    locationName: string,
  ) {
    return this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.date, date),
        eq(schema.tickets.amount, amount),
        eq(schema.tickets.locationName, locationName),
        isNull(schema.tickets.deletedAt),
      ),
    });
  }

  async create(
    data: typeof schema.tickets.$inferInsert,
    items?: (typeof schema.items.$inferInsert)[],
  ) {
    return this.db.transaction(async (tx) => {
      const [ticket] = await tx.insert(schema.tickets).values(data).returning();

      if (items && items.length > 0) {
        await tx
          .insert(schema.items)
          .values(items.map((item) => ({ ...item, ticketId: ticket.id })));
      }

      return ticket;
    });
  }

  /**
   * Updates a single item's status in place AND recomputes the parent
   * ticket's `approvedAmount` + `status` from the resulting item statuses,
   * atomically. Used by the supervisor review flow — keeps the ticket
   * aggregate in sync with the per-item decisions so the report's financial
   * summary can read it directly without re-summing items client-side.
   *
   * Ticket status rule (placeholder — will be revisited): if no item is left
   * in `Pending`, the ticket flips to `Approved`. Otherwise it stays
   * `Pending`.
   *
   * Returns the updated item (or `undefined` if the id did not match an item
   * belonging to the given ticket).
   */
  async updateItemStatus(
    ticketId: string,
    itemId: string,
    status: typeof schema.items.$inferInsert.status,
  ) {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schema.items)
        .set({ status, updatedAt: new Date() })
        .where(
          and(eq(schema.items.id, itemId), eq(schema.items.ticketId, ticketId)),
        )
        .returning();

      if (!updated) return undefined;

      await this.recomputeTicketAggregateTx(tx, ticketId);
      return updated;
    });
  }

  /**
   * Bulk set every item of a ticket to the same status — backs the supervisor
   * "Approve all" / "Reject all" buttons. Same recompute pass as the per-item
   * flow (`approvedAmount` + ticket status from the post-update items).
   */
  async updateAllItemsStatus(
    ticketId: string,
    status: typeof schema.items.$inferInsert.status,
  ) {
    return this.db.transaction(async (tx) => {
      await tx
        .update(schema.items)
        .set({ status, updatedAt: new Date() })
        .where(eq(schema.items.ticketId, ticketId));

      return this.recomputeTicketAggregateTx(tx, ticketId);
    });
  }

  /**
   * Shared helper: re-reads every item of a ticket and writes back the
   * derived `approvedAmount` and (placeholder) `status` to the parent ticket
   * row. Must run inside an already-open transaction.
   */
  private async recomputeTicketAggregateTx(
    tx: Parameters<
      Parameters<PostgresJsDatabase<typeof schema>['transaction']>[0]
    >[0],
    ticketId: string,
  ) {
    const items = await tx.query.items.findMany({
      where: eq(schema.items.ticketId, ticketId),
    });
    const approvedAmount = items.reduce(
      (sum, it) => (it.status === 'Approved' ? sum + (it.amount ?? 0) : sum),
      0,
    );
    const hasPending = items.some((it) => it.status === 'Pending');
    // Placeholder: when every item is evaluated the ticket is marked
    // `Approved`. Future iterations should branch on the mix (all-rejected,
    // partially-approved, etc.).
    const nextStatus = hasPending ? 'Pending' : 'Approved';

    const [refreshed] = await tx
      .update(schema.tickets)
      .set({ approvedAmount, status: nextStatus, updatedAt: new Date() })
      .where(eq(schema.tickets.id, ticketId))
      .returning();
    return refreshed;
  }

  async updateWithHistory(
    ticketId: string,
    updateData: Partial<typeof schema.tickets.$inferInsert>,
    historyData: typeof schema.ticketHistories.$inferInsert,
    itemsToUpdate?: (typeof schema.items.$inferInsert)[],
  ) {
    return this.db.transaction(async (tx) => {
      await tx.insert(schema.ticketHistories).values(historyData);

      const [updated] = await tx
        .update(schema.tickets)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(schema.tickets.id, ticketId))
        .returning();

      if (itemsToUpdate !== undefined) {
        await tx
          .delete(schema.items)
          .where(eq(schema.items.ticketId, ticketId));
        if (itemsToUpdate.length > 0) {
          await tx
            .insert(schema.items)
            .values(itemsToUpdate.map((i) => ({ ...i, ticketId })));
        }
      }

      return updated;
    });
  }

  async softDelete(
    ticketId: string,
    historyData: typeof schema.ticketHistories.$inferInsert,
  ) {
    return this.db.transaction(async (tx) => {
      await tx.insert(schema.ticketHistories).values(historyData);
      return tx
        .update(schema.tickets)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.tickets.id, ticketId))
        .returning();
    });
  }

  async hardDelete(ticketId: string) {
    return this.db
      .delete(schema.tickets)
      .where(eq(schema.tickets.id, ticketId));
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback);
  }
}
