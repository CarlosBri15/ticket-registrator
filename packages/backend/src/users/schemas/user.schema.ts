import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { companies } from '../../organization/schema/organization.schema';
import { relations } from 'drizzle-orm';
import { roles } from '../../roles/schemas/role.schema';
import { reports } from '../../reports/schemas/report.schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  surname: varchar('surname', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  companyId: uuid('company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'no action' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

import { usersToDepartments } from './user-relations.schema';

export const userRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  reports: many(reports),
  usersToDepartments: many(usersToDepartments),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
