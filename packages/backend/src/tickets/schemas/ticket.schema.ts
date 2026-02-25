import { pgTable, uuid, varchar, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { reports } from "../../reports/schemas/report.schema";
import { TicketStatus, TicketLifecycle, ItemStatus } from '@ticket-registrator/shared';
import type { TicketStatusType, TicketLifecycleType, ItemStatusType } from '@ticket-registrator/shared';

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),

  // Lifecycle control
  lifecycle: varchar("lifecycle", { length: 50 }).default(TicketLifecycle.DRAFT).notNull(), // TicketLifecycleType
  version: integer("version").default(0).notNull(),

  // Extracted / user-editable fields
  cgsBucketLink: varchar("cgs_bucket_link", { length: 255 }),
  paymentType: varchar("payment_type", { length: 50 }),
  expenseType: varchar("expense_type", { length: 50 }),
  date: timestamp("date"),
  locationName: varchar("location_name", { length: 255 }),
  locationAddress: varchar("location_address", { length: 255 }),
  amount: integer("amount"),
  currency: varchar("currency", { length: 10 }),
  convertedAmount: integer("converted_amount"),
  convertedCurrency: varchar("converted_currency", { length: 10 }),
  cgsBucketLinkJustification: varchar("cgs_bucket_link_justification", { length: 255 }),
  lastFourDigits: varchar("last_four_digits", { length: 4 }),

  // Status & finance
  status: varchar("status", { length: 50 }).default(TicketStatus.PENDING).notNull(), // TicketStatusType
  llmApprovedPercentage: integer("llm_approved_percentage"),
  llmRecommendation: varchar("llm_recommendation", { length: 255 }),
  llmSuggestedAmount: integer("llm_suggested_amount"),
  llmSuggestedCurrency: varchar("llm_suggested_currency", { length: 10 }),
  approvedAmount: integer("approved_amount").default(0).notNull(),

  // Items as JSONB
  items: jsonb("items").$type<{
    name: string | null;
    amount: number | null;
    currency: string | null;
    status: ItemStatusType;
  }[]>().default([]).notNull(),

  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
