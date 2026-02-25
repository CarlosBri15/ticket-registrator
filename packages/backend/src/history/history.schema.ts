import { pgTable, uuid, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { reports } from "../reports/schemas/report.schema";
import { tickets } from "../tickets/schemas/ticket.schema";

export const ticketHistories = pgTable("ticket_histories", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  // Note: Since tickets table is referenced before definition in this file or requires a circular import,
  // we might want to be careful. Drizzle handles this fine if they are in separate files.
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").notNull(),
  oldSnapshot: jsonb("old_snapshot").notNull(),
  newSnapshot: jsonb("new_snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TicketHistory = typeof ticketHistories.$inferSelect;
export type InsertTicketHistory = typeof ticketHistories.$inferInsert;
