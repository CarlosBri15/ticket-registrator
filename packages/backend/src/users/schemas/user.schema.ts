import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { companies } from "../../organization/schema/organization.schema";
import { departments } from "../../department/department.schema";
import { Roles } from "@ticket-registrator/shared";
import type { RoleType } from "@ticket-registrator/shared";

// We extract enum values for Drizzle check constraints or mapping if needed, 
// though Drizzle has pgEnum as well. Using simple varchar is often easier.
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    surname: varchar("surname", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).$type<RoleType>().notNull(), // Should match RoleType
    companyId: uuid("company_id")
        .references(() => companies.id, { onDelete: "cascade" })
        .notNull(),
    departmentId: uuid("department_id")
        .references(() => departments.id, { onDelete: "cascade" })
        .notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;