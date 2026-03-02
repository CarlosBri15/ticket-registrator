import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { companies } from "../../organization/schema/organization.schema";
import { departments } from "../../department/schema/department.schema";
import { relations } from "drizzle-orm";
import { roles } from "../../roles/schemas/role.schema";
import { reports } from "../../reports/schemas/report.schema";

// We extract enum values for Drizzle check constraints or mapping if needed, 
// though Drizzle has pgEnum as well. Using simple varchar is often easier.
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    surname: varchar("surname", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    roleId: uuid("role_id").references(() => roles.id).notNull(),
    companyId: uuid("company_id")
        .references(() => companies.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
        .references(() => departments.id, { onDelete: "cascade" }),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ one, many }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
    department: one(departments, {
        fields: [users.departmentId],
        references: [departments.id],
    }),
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    reports: many(reports),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;