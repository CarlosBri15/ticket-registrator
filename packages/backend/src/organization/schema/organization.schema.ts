import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { departments } from '../../department/schema/department.schema';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgName: varchar('org_name', { length: 255 }).notNull(),
  //isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const companyRelations = relations(companies, ({ many }) => ({
  departments: many(departments),
}));

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
