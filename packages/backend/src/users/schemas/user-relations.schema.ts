import { pgTable, uuid, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { departments } from '../../department/schema/department.schema';

// Junction table for Users <-> Departments
export const usersToDepartments = pgTable(
  'users_to_departments',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.departmentId] }),
  }),
);

export const usersToDepartmentsRelations = relations(
  usersToDepartments,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToDepartments.userId],
      references: [users.id],
    }),
    department: one(departments, {
      fields: [usersToDepartments.departmentId],
      references: [departments.id],
    }),
  }),
);
