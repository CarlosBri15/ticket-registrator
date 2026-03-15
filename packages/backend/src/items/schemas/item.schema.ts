import { pgTable, uuid, varchar, real, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tickets } from '../../tickets/schemas/ticket.schema';
import { ItemStatus } from '@ticket-registrator/shared';
import type { ItemStatusType } from '@ticket-registrator/shared';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .references(() => tickets.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }),
  amount: real('amount'),
  currency: varchar('currency', { length: 10 }),
  status: varchar('status', { length: 50 })
    .$type<ItemStatusType>()
    .default(ItemStatus.PENDING)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const itemRelations = relations(items, ({ one }) => ({
  ticket: one(tickets, {
    fields: [items.ticketId],
    references: [tickets.id],
  }),
}));

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
