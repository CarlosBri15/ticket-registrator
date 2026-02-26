import { pgTable, uuid, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { reports } from "../reports/schemas/report.schema";
import { tickets } from "../tickets/schemas/ticket.schema";

export const ticketHistories = pgTable("ticket_histories", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").notNull(),
  oldSnapshot: jsonb("old_snapshot").notNull(),
  newSnapshot: jsonb("new_snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketHistoryRelations = relations(ticketHistories, ({ one }) => ({
  report: one(reports, {
    fields: [ticketHistories.reportId],
    references: [reports.id],
  }),
  ticket: one(tickets, {
    fields: [ticketHistories.ticketId],
    references: [tickets.id],
  }),
}));

export type TicketHistory = typeof ticketHistories.$inferSelect;
export type InsertTicketHistory = typeof ticketHistories.$inferInsert;
