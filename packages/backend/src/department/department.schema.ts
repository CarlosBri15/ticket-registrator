import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { companies } from "../organization/schema/organization.schema";

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  departmentName: varchar("department_name", { length: 255 }).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
