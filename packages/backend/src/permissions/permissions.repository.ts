import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { Permission, InsertPermission } from './schemas/permission.schema';
import {
  RolePermission,
  InsertRolePermission,
} from './schemas/role-permission.schema';

@Injectable()
export class PermissionsRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.db.query.permissions.findMany({
      where: isNull(schema.permissions.deletedAt),
      orderBy: [desc(schema.permissions.createdAt)],
    });
  }

  async findById(id: string): Promise<Permission | undefined> {
    return this.db.query.permissions.findFirst({
      where: and(
        eq(schema.permissions.id, id),
        isNull(schema.permissions.deletedAt),
      ),
    });
  }

  async findByName(name: string): Promise<Permission | undefined> {
    return this.db.query.permissions.findFirst({
      where: and(
        eq(schema.permissions.name, name),
        isNull(schema.permissions.deletedAt),
      ),
    });
  }

  async create(data: InsertPermission): Promise<Permission> {
    const [permission] = await this.db
      .insert(schema.permissions)
      .values(data)
      .returning();
    return permission;
  }

  async update(
    id: string,
    data: Partial<InsertPermission>,
  ): Promise<Permission> {
    const [permission] = await this.db
      .update(schema.permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.permissions.id, id))
      .returning();
    return permission;
  }

  async assignToRole(data: InsertRolePermission): Promise<RolePermission> {
    const [mapping] = await this.db
      .insert(schema.rolePermissions)
      .values(data)
      .returning();
    return mapping;
  }

  async unassignFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.db
      .delete(schema.rolePermissions)
      .where(
        and(
          eq(schema.rolePermissions.roleId, roleId),
          eq(schema.rolePermissions.permissionId, permissionId),
        ),
      );
  }

  async bulkInsertPermissions(data: InsertPermission[]): Promise<void> {
    if (data.length === 0) return;
    await this.db
      .insert(schema.permissions)
      .values(data)
      .onConflictDoUpdate({
        target: schema.permissions.name,
        set: {
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
  }
}
