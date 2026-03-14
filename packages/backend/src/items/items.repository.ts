import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { Item, InsertItem } from './schemas/item.schema';

@Injectable()
export class ItemsRepository {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findByTicketId(ticketId: string): Promise<Item[]> {
    return this.db.query.items.findMany({
      where: eq(schema.items.ticketId, ticketId),
    });
  }

  async findById(id: string): Promise<Item | undefined> {
    return this.db.query.items.findFirst({
      where: eq(schema.items.id, id),
    });
  }

  async bulkCreate(data: InsertItem[]): Promise<Item[]> {
    if (data.length === 0) return [];
    return this.db.insert(schema.items).values(data).returning();
  }

  async bulkDeleteByTicketId(ticketId: string): Promise<void> {
    await this.db.delete(schema.items).where(eq(schema.items.ticketId, ticketId));
  }
}
