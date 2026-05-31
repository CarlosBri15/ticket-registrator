import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull, or, inArray, desc } from 'drizzle-orm';
import { Role, InsertRole } from './schemas/role.schema';
import {
  Permission,
  InsertPermission,
} from '../permissions/schemas/permission.schema';
import {
  RolePermission,
  InsertRolePermission,
} from '../permissions/schemas/role-permission.schema';

@Injectable()
export class RolesRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllSystemRoles(): Promise<Role[]> {
    return this.db.query.roles.findMany({
      where: and(
        isNull(schema.roles.deletedAt),
        isNull(schema.roles.companyId),
      ),
      orderBy: [desc(schema.roles.hierarchy)],
    });
  }

  async findAllCompanyRoles(companyId: string): Promise<Role[]> {
    return this.db.query.roles.findMany({
      where: and(
        isNull(schema.roles.deletedAt),
        or(
          eq(schema.roles.companyId, companyId),
          isNull(schema.roles.companyId),
        ),
      ),
      orderBy: [desc(schema.roles.hierarchy)],
    });
  }

  async findById(id: string): Promise<Role | undefined> {
    return this.db.query.roles.findFirst({
      where: and(eq(schema.roles.id, id), isNull(schema.roles.deletedAt)),
    });
  }

  async findByNameAndCompany(
    name: string,
    companyId: string | null,
  ): Promise<Role | undefined> {
    return this.db.query.roles.findFirst({
      where: and(
        eq(schema.roles.name, name),
        companyId
          ? eq(schema.roles.companyId, companyId)
          : isNull(schema.roles.companyId),
        isNull(schema.roles.deletedAt),
      ),
    });
  }

  async create(data: InsertRole): Promise<Role> {
    const [role] = await this.db.insert(schema.roles).values(data).returning();
    return role;
  }

  async update(id: string, data: Partial<InsertRole>): Promise<Role> {
    const [role] = await this.db
      .update(schema.roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.roles.id, id))
      .returning();
    return role;
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.db.query.permissions.findMany();
  }

  async bulkInsertPermissions(data: InsertPermission[]): Promise<void> {
    if (data.length === 0) return;
    await this.db.insert(schema.permissions).values(data);
  }

  async bulkInsertRoles(data: InsertRole[]): Promise<void> {
    if (data.length === 0) return;
    await this.db.insert(schema.roles).values(data);
  }

  async findAllRolePermissions(
    companyId: string | null,
  ): Promise<RolePermission[]> {
    return this.db.query.rolePermissions.findMany({
      where: companyId
        ? eq(schema.rolePermissions.companyId, companyId)
        : isNull(schema.rolePermissions.companyId),
    });
  }

  async bulkInsertRolePermissions(data: InsertRolePermission[]): Promise<void> {
    if (data.length === 0) return;
    await this.db.insert(schema.rolePermissions).values(data);
  }

  async getRolePermissionsByNames(
    roleNames: string[],
    companyId: string | null,
  ) {
    return this.db.query.roles.findMany({
      where: and(
        inArray(schema.roles.name, roleNames),
        isNull(schema.roles.deletedAt),
        or(
          companyId
            ? eq(schema.roles.companyId, companyId)
            : isNull(schema.roles.companyId),
          isNull(schema.roles.companyId),
        ),
      ),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  async getRolePermissionsById(roleId: string, companyId: string | null) {
    return this.db.query.roles.findFirst({
      where: and(
        eq(schema.roles.id, roleId),
        isNull(schema.roles.deletedAt),
        or(
          companyId
            ? eq(schema.roles.companyId, companyId)
            : isNull(schema.roles.companyId),
          isNull(schema.roles.companyId),
        ),
      ),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback);
  }
}
