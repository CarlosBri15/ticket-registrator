import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { reports } from '../../reports/schemas/report.schema';
import { items } from '../../items/schemas/item.schema';
import { ticketHistories } from '../../history/history.schema';
import { TicketStatus, TicketLifecycle } from '@ticket-registrator/shared';

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id')
    .references(() => reports.id, { onDelete: 'cascade' })
    .notNull(),

  lifecycle: varchar('lifecycle', { length: 50 })
    .default(TicketLifecycle.DRAFT)
    .notNull(), // TicketLifecycleType
  version: integer('version').default(0).notNull(),

  cgsBucketLink: varchar('cgs_bucket_link', { length: 255 }),
  paymentType: varchar('payment_type', { length: 50 }),
  expenseType: varchar('expense_type', { length: 50 }),
  date: timestamp('date'),
  locationName: varchar('location_name', { length: 255 }),
  locationAddress: varchar('location_address', { length: 255 }),
  amount: real('amount'),
  currency: varchar('currency', { length: 10 }),
  convertedAmount: real('converted_amount'),
  convertedCurrency: varchar('converted_currency', { length: 10 }),
  cgsBucketLinkJustification: varchar('cgs_bucket_link_justification', {
    length: 255,
  }),
  lastFourDigits: varchar('last_four_digits', { length: 4 }),
  imageId: varchar('image_id', { length: 255 }),

  status: varchar('status', { length: 50 })
    .default(TicketStatus.PENDING)
    .notNull(), // TicketStatusType
  llmApprovedPercentage: integer('llm_approved_percentage'),
  llmRecommendation: varchar('llm_recommendation', { length: 255 }),
  llmSuggestedAmount: real('llm_suggested_amount'),
  llmSuggestedCurrency: varchar('llm_suggested_currency', { length: 10 }),
  approvedAmount: real('approved_amount').default(0).notNull(),

  flag: boolean('flag').default(false).notNull(),
  llmComment: varchar('llm_comment', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const ticketRelations = relations(tickets, ({ one, many }) => ({
  report: one(reports, {
    fields: [tickets.reportId],
    references: [reports.id],
  }),
  items: many(items),
  ticketHistories: many(ticketHistories),
}));

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
