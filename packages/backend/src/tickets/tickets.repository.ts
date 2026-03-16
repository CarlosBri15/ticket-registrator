import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, SQL, desc, isNull } from 'drizzle-orm';

@Injectable()
export class TicketsRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    return this.db.query.tickets.findFirst({
      where: and(eq(schema.tickets.id, id), isNull(schema.tickets.deletedAt)),
      with: { items: true },
    });
  }

  async findByReportId(reportId: string) {
    return this.db.query.tickets.findMany({
      where: and(
        eq(schema.tickets.reportId, reportId),
        isNull(schema.tickets.deletedAt),
      ),
      with: { items: true },
      orderBy: [desc(schema.tickets.createdAt)],
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

  async updateWithHistory(
    ticketId: string,
    updateData: Partial<typeof schema.tickets.$inferInsert>,
    historyData: typeof schema.ticketHistories.$inferInsert,
    itemsToUpdate?: (typeof schema.items.$inferInsert)[],
  ) {
    return this.db.transaction(async (tx) => {
      // 1. Add history
      await tx.insert(schema.ticketHistories).values(historyData);

      // 2. Update ticket
      const [updated] = await tx
        .update(schema.tickets)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(schema.tickets.id, ticketId))
        .returning();

      // 3. Optional items update (delete old, insert new)
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

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback as any); // Drizzle transaction context is slightly different but compatible in this context
  }
}
