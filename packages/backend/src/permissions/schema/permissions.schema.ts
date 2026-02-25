import { pgTable, uuid, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "../../users/schemas/user.schema";
import type { PermissionType } from "@ticket-registrator/shared";

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  permissions: jsonb("permissions").$type<PermissionType[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;
