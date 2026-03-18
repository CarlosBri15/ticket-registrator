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
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  companyId: uuid('company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }),
  isSystem: boolean('is_system').default(false).notNull(),
  hierarchy: integer('hierarchy').notNull(),
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
