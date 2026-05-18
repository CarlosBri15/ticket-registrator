import { pgTable, uuid, varchar, timestamp, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, type User } from '../../users/schemas/user.schema';
import {
  tickets,
  type TicketWithItems,
} from '../../tickets/schemas/ticket.schema';
import { ticketHistories } from '../../history/history.schema';
import { ReportStatus } from '@ticket-registrator/shared';

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  requestedAmount: real('requested_amount').default(0).notNull(),
  approvedAmount: real('approved_amount').default(0).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 })
    .default(ReportStatus.CREATED)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const reportRelations = relations(reports, ({ one, many }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  tickets: many(tickets),
  ticketHistories: many(ticketHistories),
}));

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export type ReportWithTickets = Report & {
  user?: User | null;
  tickets?: TicketWithItems[];
};
