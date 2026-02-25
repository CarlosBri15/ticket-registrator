import { pgTable, uuid, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "../../users/schemas/user.schema";
import type { ReportStatusType } from "@ticket-registrator/shared";
import { ReportStatus } from "@ticket-registrator/shared";

export const reports = pgTable("reports", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    // For monetary amounts, consider using numeric/decimal. Using integer (cents) or real as a quick replacement.
    // Mongoose was using Number. Let's use real (float) or decimal for now. 
    requestedAmount: integer("requested_amount").default(0).notNull(),
    approvedAmount: integer("approved_amount").default(0).notNull(),
    currency: varchar("currency", { length: 10 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).default(ReportStatus.CREATED).notNull(), // ReportStatusType
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;