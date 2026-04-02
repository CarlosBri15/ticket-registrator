import { Test, TestingModule } from '@nestjs/testing';
import { SeedService, UNASSIGNED_DEPARTMENT_NAME } from './seed.service';
import { CryptoService } from '../crypto/crypto.service';
import { RolesRepository } from '../roles/roles.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { CategoriesRepository } from '../categories/categories.repository';
import { DB_CONNECTION } from '../db/db.module';
import {
  Roles,
  ROLE_HIERARCHY,
  ROLE_DEFAULT_PERMISSIONS,
} from '@ticket-registrator/shared';

jest.mock('drizzle-orm/postgres-js/migrator', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));

describe('SeedService', () => {
  let service: SeedService;
  let cryptoServiceMock: any;
  let rolesRepositoryMock: any;
  let permissionsServiceMock: any;
  let categoriesRepositoryMock: any;
  let dbMock: any;

  beforeEach(async () => {
    cryptoServiceMock = {
      hashPassword: jest.fn().mockResolvedValue('hashed-pass'),
    };

    rolesRepositoryMock = {
      findAllSystemRoles: jest.fn().mockResolvedValue([]),
      findAllPermissions: jest.fn().mockResolvedValue([]),
      findAllRolePermissions: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'role-id' }),
      update: jest.fn().mockResolvedValue(undefined),
      bulkInsertRolePermissions: jest.fn().mockResolvedValue(undefined),
    };

    permissionsServiceMock = {
      seedDefaultPermissions: jest.fn().mockResolvedValue({ message: 'done' }),
    };

    categoriesRepositoryMock = {
      findAllSystemCategories: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue([]),
    };

    dbMock = {
      query: {
        departments: { findFirst: jest.fn().mockResolvedValue(null) },
        roles: { findFirst: jest.fn().mockResolvedValue(null) },
        users: { findFirst: jest.fn().mockResolvedValue(null) },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: CryptoService, useValue: cryptoServiceMock },
        { provide: RolesRepository, useValue: rolesRepositoryMock },
        { provide: PermissionsService, useValue: permissionsServiceMock },
        { provide: CategoriesRepository, useValue: categoriesRepositoryMock },
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should run migrations and seeding on bootstrap', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ id: 'superadmin-role' });
      jest.spyOn(service, 'seedSystemAll').mockResolvedValue({
        permissions: { message: 'done' },
        roles: { message: 'done' },
        rolePermissions: { message: 'done' },
      } as any);
      jest.spyOn(service as any, 'seedSuperAdmin').mockResolvedValue(undefined);
      jest
        .spyOn(service, 'seedUnassignedDepartment')
        .mockResolvedValue(undefined);

      await service.onApplicationBootstrap();

      expect(service.seedSystemAll).toHaveBeenCalled();
    });

    it('should stop seeding if migration fails', async () => {
      const { migrate } = require('drizzle-orm/postgres-js/migrator');
      (migrate as jest.Mock).mockRejectedValueOnce(
        new Error('migration failed'),
      );

      jest.spyOn(service, 'seedSystemAll').mockResolvedValue({} as any);

      await service.onApplicationBootstrap();

      expect(service.seedSystemAll).not.toHaveBeenCalled();
    });

    it('should not crash if seeding throws', async () => {
      jest
        .spyOn(service, 'seedSystemAll')
        .mockRejectedValue(new Error('seed error'));

      await expect(service.onApplicationBootstrap()).resolves.not.toThrow();
    });
  });

  describe('seedSystemAll', () => {
    it('should call all seed methods and return combined result', async () => {
      jest
        .spyOn(service, 'seedDefaultPermissions')
        .mockResolvedValue({ message: 'perms' } as any);
      jest
        .spyOn(service, 'seedDefaultRoles')
        .mockResolvedValue({ message: 'roles' } as any);
      jest
        .spyOn(service, 'seedDefaultRolePermissions')
        .mockResolvedValue({ message: 'rolePerms' } as any);
      jest
        .spyOn(service, 'seedDefaultCategories')
        .mockResolvedValue({ message: 'categories' } as any);

      const result = await service.seedSystemAll();
      expect(result.permissions).toEqual({ message: 'perms' });
      expect(result.roles).toEqual({ message: 'roles' });
      expect(result.rolePermissions).toEqual({ message: 'rolePerms' });
      expect(result.categories).toEqual({ message: 'categories' });
    });
  });

  describe('seedDefaultPermissions', () => {
    it('should delegate to permissionsService', async () => {
      await service.seedDefaultPermissions();
      expect(permissionsServiceMock.seedDefaultPermissions).toHaveBeenCalled();
    });
  });

  describe('seedDefaultRoles', () => {
    it('should create new roles when none exist', async () => {
      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue([]);

      const result = await service.seedDefaultRoles();
      expect(rolesRepositoryMock.create).toHaveBeenCalled();
      expect(result.message).toContain('new');
    });

    it('should update existing roles with changed hierarchy or description', async () => {
      const roleName = Object.values(Roles)[0] as keyof typeof ROLE_HIERARCHY;
      const correctHierarchy = ROLE_HIERARCHY[roleName];
      const existingRole = {
        id: 'r-1',
        name: roleName,
        hierarchy: correctHierarchy + 99, // wrong hierarchy
        description: 'old description',
      };
      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue([existingRole]);

      await service.seedDefaultRoles();
      expect(rolesRepositoryMock.update).toHaveBeenCalled();
    });

    it('should skip roles that are already up to date', async () => {
      // Mock ALL roles with correct hierarchy and description so none need to be created or updated
      const allExistingRoles = Object.values(Roles).map((roleName, idx) => ({
        id: `r-${idx}`,
        name: roleName,
        hierarchy: ROLE_HIERARCHY[roleName as keyof typeof ROLE_HIERARCHY],
        description: `System default role: ${roleName}`,
      }));
      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue(
        allExistingRoles,
      );
      rolesRepositoryMock.create.mockClear();
      rolesRepositoryMock.update.mockClear();

      await service.seedDefaultRoles();
      expect(rolesRepositoryMock.create).not.toHaveBeenCalled();
      expect(rolesRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('seedDefaultRolePermissions', () => {
    it('should insert missing role-permission mappings', async () => {
      const roleName = Object.keys(ROLE_DEFAULT_PERMISSIONS)[0];
      const permName = (ROLE_DEFAULT_PERMISSIONS as any)[roleName][0];

      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue([
        { id: 'role-id', name: roleName },
      ]);
      rolesRepositoryMock.findAllPermissions.mockResolvedValue([
        { id: 'perm-id', name: permName },
      ]);
      rolesRepositoryMock.findAllRolePermissions.mockResolvedValue([]);

      const result = await service.seedDefaultRolePermissions();
      expect(rolesRepositoryMock.bulkInsertRolePermissions).toHaveBeenCalled();
      expect(result.message).toContain('Seeded');
    });

    it('should skip when all role-permissions already exist', async () => {
      const roleName = Object.keys(ROLE_DEFAULT_PERMISSIONS)[0];
      const permName = (ROLE_DEFAULT_PERMISSIONS as any)[roleName][0];

      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue([
        { id: 'role-id', name: roleName },
      ]);
      rolesRepositoryMock.findAllPermissions.mockResolvedValue([
        { id: 'perm-id', name: permName },
      ]);
      rolesRepositoryMock.findAllRolePermissions.mockResolvedValue([
        { roleId: 'role-id', permissionId: 'perm-id' },
      ]);

      const result = await service.seedDefaultRolePermissions();
      expect(
        rolesRepositoryMock.bulkInsertRolePermissions,
      ).not.toHaveBeenCalled();
      expect(result.message).toContain('already seeded');
    });

    it('should skip role entries not in roleMap', async () => {
      rolesRepositoryMock.findAllSystemRoles.mockResolvedValue([]);
      rolesRepositoryMock.findAllPermissions.mockResolvedValue([
        { id: 'p1', name: 'some-perm' },
      ]);
      rolesRepositoryMock.findAllRolePermissions.mockResolvedValue([]);

      const result = await service.seedDefaultRolePermissions();
      expect(result.message).toContain('already seeded');
    });
  });

  describe('seedUnassignedDepartment', () => {
    it('should create the Unassigned department when it does not exist', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue(null);

      await service.seedUnassignedDepartment();
      expect(dbMock.insert).toHaveBeenCalled();
    });

    it('should skip creating when Unassigned department already exists', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue({
        id: 'dept-1',
        departmentName: UNASSIGNED_DEPARTMENT_NAME,
      });
      dbMock.insert.mockClear();

      await service.seedUnassignedDepartment();
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });

  describe('seedSuperAdmin (private, tested via onApplicationBootstrap)', () => {
    it('should create SuperAdmin user when not existing', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({
        id: 'superadmin-role-id',
      });
      dbMock.query.users.findFirst.mockResolvedValue(null);
      jest.spyOn(service, 'seedSystemAll').mockResolvedValue({} as any);
      jest
        .spyOn(service, 'seedUnassignedDepartment')
        .mockResolvedValue(undefined);

      await service.onApplicationBootstrap();

      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith('SuperAdmin');
      expect(dbMock.insert).toHaveBeenCalled();
    });

    it('should skip creating SuperAdmin when already exists', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({
        id: 'superadmin-role-id',
      });
      dbMock.query.users.findFirst.mockResolvedValue({ id: 'existing-user' });
      jest.spyOn(service, 'seedSystemAll').mockResolvedValue({} as any);
      jest
        .spyOn(service, 'seedUnassignedDepartment')
        .mockResolvedValue(undefined);
      dbMock.insert.mockClear();

      await service.onApplicationBootstrap();

      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it('should handle missing SuperAdmin role gracefully', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue(null);
      jest.spyOn(service, 'seedSystemAll').mockResolvedValue({} as any);
      jest
        .spyOn(service, 'seedUnassignedDepartment')
        .mockResolvedValue(undefined);

      await expect(service.onApplicationBootstrap()).resolves.not.toThrow();
    });
  });
});
