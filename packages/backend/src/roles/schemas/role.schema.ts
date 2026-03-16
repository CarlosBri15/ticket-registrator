import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { companies } from '../../organization/schema/organization.schema';
import { rolePermissions } from '../../permissions/schemas/role-permission.schema';

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(), // e.g. "Super Admin", "Admin", "Controller", "Manager", "Employee"
  description: varchar('description', { length: 255 }),
  companyId: uuid('company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }), // Can be null if the role is a system-level role (e.g. system-wide SuperAdmin)
  isSystem: boolean('is_system').default(false).notNull(), // Flag to prevent companies from editing default roles
  hierarchy: integer('hierarchy').notNull(), // e.g. Employee=1, Manager=2, Controller=3, Admin=4, SuperAdmin=5
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const roleRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, {
    fields: [roles.companyId],
    references: [companies.id],
  }),
  rolePermissions: many(rolePermissions),
}));

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;
