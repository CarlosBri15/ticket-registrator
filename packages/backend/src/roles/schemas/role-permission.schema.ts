import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roles } from "./role.schema";
import { permissions } from "./permission.schema";
import { companies } from "../../organization/schema/organization.schema";

export const rolePermissions = pgTable("role_permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
    permissionId: uuid("permission_id").references(() => permissions.id, { onDelete: "cascade" }).notNull(),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// A junction table requires relations to both of its connected tables
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
    company: one(companies, {
        fields: [rolePermissions.companyId],
        references: [companies.id],
    }),
}));

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;
