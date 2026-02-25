import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
