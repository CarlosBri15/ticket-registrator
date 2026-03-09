import { pgTable, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.schema";
import { roles } from "../../roles/schemas/role.schema";
import { departments } from "../../department/schema/department.schema";

// Junction table for Users <-> Roles
export const usersToRoles = pgTable("users_to_roles", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// Junction table for Users <-> Departments
export const usersToDepartments = pgTable("users_to_departments", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").notNull().references(() => departments.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.departmentId] }),
}));

// Relations for the junction tables
export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
    user: one(users, {
        fields: [usersToRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [usersToRoles.roleId],
        references: [roles.id],
    }),
}));

export const usersToDepartmentsRelations = relations(usersToDepartments, ({ one }) => ({
    user: one(users, {
        fields: [usersToDepartments.userId],
        references: [users.id],
    }),
    department: one(departments, {
        fields: [usersToDepartments.departmentId],
        references: [departments.id],
    }),
}));
