import {
  Injectable,
  OnApplicationBootstrap,
  Inject,
  Logger,
} from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { RolesRepository } from '../roles/roles.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  Roles,
  ROLE_HIERARCHY,
  ROLE_DEFAULT_PERMISSIONS,
  DEFAULT_CATEGORIES,
} from '@ticket-registrator/shared';
import { CategoriesRepository } from '../categories/categories.repository';
import { InsertRolePermission } from '../permissions/schemas/role-permission.schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { join } from 'node:path';

export const UNASSIGNED_DEPARTMENT_NAME = 'Unassigned';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsService: PermissionsService,
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('--- AUTO MIGRATIONS START ---');
    try {
      await migrate(this.db, {
        migrationsFolder: join(process.cwd(), 'drizzle'),
      });
      this.logger.log('--- AUTO MIGRATIONS FINISHED ---');
    } catch (error) {
      this.logger.error('--- MIGRATIONS FAILED ---', error);
      return;
    }

    this.logger.log('--- AUTO SEEDING START ---');
    try {
      const seedResult = await this.seedSystemAll();
      this.logger.log(`Seeding result: ${JSON.stringify(seedResult)}`);
      await this.seedSuperAdmin();
      await this.seedUnassignedDepartment();
      this.logger.log('--- AUTO SEEDING FINISHED ---');
    } catch (error) {
      this.logger.error('Error during automatic seeding:', error);
    }
  }

  async seedSystemAll() {
    const permsResult = await this.seedDefaultPermissions();
    const rolesResult = await this.seedDefaultRoles();
    const rolePermsResult = await this.seedDefaultRolePermissions();
    const categoriesResult = await this.seedDefaultCategories();
    return {
      permissions: permsResult,
      roles: rolesResult,
      rolePermissions: rolePermsResult,
      categories: categoriesResult,
    };
  }

  async seedDefaultPermissions() {
    return this.permissionsService.seedDefaultPermissions();
  }

  async seedDefaultRoles() {
    const rolesToSeed = Object.values(Roles);
    const existingRoles = await this.rolesRepository.findAllSystemRoles();
    const existingMap = new Map(existingRoles.map((r) => [r.name, r]));

    let seededCount = 0;
    let updatedCount = 0;

    for (const roleName of rolesToSeed) {
      const existing = existingMap.get(roleName);
      const hierarchy = ROLE_HIERARCHY[roleName as keyof typeof ROLE_HIERARCHY];
      const description = `System default role: ${roleName}`;

      if (existing) {
        if (
          existing.hierarchy !== hierarchy ||
          existing.description !== description
        ) {
          await this.rolesRepository.update(existing.id, {
            hierarchy,
            description,
          });
          updatedCount++;
        }
      } else {
        await this.rolesRepository.create({
          name: roleName,
          hierarchy,
          isSystem: true,
          companyId: null,
          description,
        });
        seededCount++;
      }
    }

    this.logger.log(
      `Seeding roles: ${seededCount} new, ${updatedCount} updated`,
    );
    return {
      message: `Processed ${rolesToSeed.length} system roles (${seededCount} new, ${updatedCount} updated)`,
    };
  }

  async seedDefaultRolePermissions() {
    const allRoles = await this.rolesRepository.findAllSystemRoles();
    const allPerms = await this.rolesRepository.findAllPermissions();

    const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));
    const permMap = new Map(allPerms.map((p) => [p.name, p.id]));

    const existingMappings =
      await this.rolesRepository.findAllRolePermissions(null);
    const existingSet = new Set(
      existingMappings.map((rp) => `${rp.roleId}-${rp.permissionId}`),
    );

    const valuesToInsert: InsertRolePermission[] = [];

    for (const [roleName, assignedPerms] of Object.entries(
      ROLE_DEFAULT_PERMISSIONS,
    )) {
      const roleId = roleMap.get(roleName);
      if (!roleId) continue;
      for (const permName of assignedPerms) {
        const permId = permMap.get(permName);
        if (!permId) continue;
        if (!existingSet.has(`${roleId}-${permId}`)) {
          valuesToInsert.push({
            roleId,
            permissionId: permId,
            companyId: null,
          });
        }
      }
    }

    if (valuesToInsert.length === 0)
      return { message: 'All default role-permissions already seeded' };

    await this.rolesRepository.bulkInsertRolePermissions(valuesToInsert);
    this.logger.log(
      `Seeded ${valuesToInsert.length} role-permissions mappings`,
    );
    return {
      message: `Seeded ${valuesToInsert.length} role-permissions mappings`,
    };
  }

  async seedUnassignedDepartment() {
    const existing = await this.db.query.departments.findFirst({
      where: eq(schema.departments.departmentName, UNASSIGNED_DEPARTMENT_NAME),
    });
    if (!existing) {
      await this.db.insert(schema.departments).values({
        departmentName: UNASSIGNED_DEPARTMENT_NAME,
        companyId: null,
      });
      this.logger.log(
        `Global '${UNASSIGNED_DEPARTMENT_NAME}' department seeded.`,
      );
    }
  }

  async seedDefaultCategories() {
    const existingCategories =
      await this.categoriesRepository.findAllSystemCategories();
    const existingMap = new Map(existingCategories.map((c) => [c.name, c]));

    let seededCount = 0;
    let updatedCount = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = existingMap.get(cat.name);

      if (existing) {
        if (existing.description !== cat.description) {
          await this.categoriesRepository.update(existing.id, {
            description: cat.description,
          });
          updatedCount++;
        }
      } else {
        await this.categoriesRepository.create({
          name: cat.name,
          description: cat.description,
          organizationId: null,
          isSystem: true,
        });
        seededCount++;
      }
    }

    this.logger.log(
      `Seeding categories: ${seededCount} new, ${updatedCount} updated`,
    );
    return {
      message: `Processed ${DEFAULT_CATEGORIES.length} system categories (${seededCount} new, ${updatedCount} updated)`,
    };
  }

  private async seedSuperAdmin() {
    const superAdminRole = await this.db.query.roles.findFirst({
      where: eq(schema.roles.name, Roles.SUPERADMIN),
    });

    if (!superAdminRole) {
      this.logger.error('SuperAdmin role not found in database!');
      return;
    }

    const existingSuperAdmin = await this.db.query.users.findFirst({
      where: eq(schema.users.username, 'SuperAdmin'),
    });

    if (existingSuperAdmin) {
      this.logger.log('SuperAdmin user already exists.');
    } else {
      await this.db
        .insert(schema.users)
        .values({
          name: 'Super',
          surname: 'Admin',
          username: 'SuperAdmin',
          email: 'superadmin@system.com',
          password: await this.cryptoService.hashPassword('SuperAdmin'),
          roleId: superAdminRole.id,
        })
        .returning();
      this.logger.log('SuperAdmin user created successfully');
    }
  }
}
