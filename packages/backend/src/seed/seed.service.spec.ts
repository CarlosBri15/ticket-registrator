import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { CryptoService } from '../crypto/crypto.service';
import { RolesRepository } from '../roles/roles.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { CategoriesRepository } from '../categories/categories.repository';
import { DB_CONNECTION } from '../db/db.module';
import { DEFAULT_CATEGORIES, Roles } from '@ticket-registrator/shared';

const AIRFARE_DESCRIPTION = DEFAULT_CATEGORIES.find((c) => c.name === 'Airfare')!.description;
const AIRFARE_COLOR = '#5E81A8';
const AIRFARE_ICON = 'Plane';

describe('SeedService', () => {
  let service: SeedService;
  let mockDb: any;
  let mockRolesRepository: any;
  let mockPermissionsService: any;
  let mockCategoriesRepository: any;
  let mockCryptoService: any;

  beforeEach(async () => {
    mockDb = {
      query: {
        departments: { findFirst: jest.fn() },
        roles: { findFirst: jest.fn() },
        users: { findFirst: jest.fn() },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'new-id' }]),
        }),
      }),
    };

    mockRolesRepository = {
      findAllSystemRoles: jest.fn().mockResolvedValue([]),
      findAllPermissions: jest.fn().mockResolvedValue([]),
      findAllRolePermissions: jest.fn().mockResolvedValue([]),
      bulkInsertRolePermissions: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockPermissionsService = {
      seedDefaultPermissions: jest.fn().mockResolvedValue({ message: 'Seeded' }),
    };

    mockCategoriesRepository = {
      findAllSystemCategories: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockCryptoService = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: RolesRepository, useValue: mockRolesRepository },
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: CategoriesRepository, useValue: mockCategoriesRepository },
        { provide: DB_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDefaultRoles', () => {
    it('should create new roles if they do not exist', async () => {
      mockRolesRepository.findAllSystemRoles.mockResolvedValue([]);

      const result = await service.seedDefaultRoles();

      expect(mockRolesRepository.create).toHaveBeenCalled();
      expect(result.message).toContain('Processed');
    });

    it('should update roles if hierarchy or description changed', async () => {
      mockRolesRepository.findAllSystemRoles.mockResolvedValue([
        { id: '1', name: Roles.SUPERADMIN, hierarchy: 999, description: 'Old' },
      ]);

      await service.seedDefaultRoles();

      expect(mockRolesRepository.update).toHaveBeenCalled();
    });
  });

  describe('seedDefaultRolePermissions', () => {
    it('should skip if all permissions are already seeded', async () => {
      mockRolesRepository.findAllSystemRoles.mockResolvedValue([{ name: Roles.ADMIN, id: 'r1' }]);
      mockRolesRepository.findAllPermissions.mockResolvedValue([{ name: 'perm1', id: 'p1' }]);
      mockRolesRepository.findAllRolePermissions.mockResolvedValue([{ roleId: 'r1', permissionId: 'p1' }]);

      const result = await service.seedDefaultRolePermissions();
      expect(result.message).toBe('All default role-permissions already seeded');
    });
  });

  describe('seedUnassignedDepartment', () => {
    it('should create department if it does not exist', async () => {
      mockDb.query.departments.findFirst.mockResolvedValue(null);

      await service.seedUnassignedDepartment();

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should skip if department exists', async () => {
      mockDb.query.departments.findFirst.mockResolvedValue({ id: '1' });

      await service.seedUnassignedDepartment();

      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('seedDefaultCategories', () => {
    it('creates each system category with its color and icon when none exist', async () => {
      mockCategoriesRepository.findAllSystemCategories.mockResolvedValue([]);

      const result = await service.seedDefaultCategories();

      expect(mockCategoriesRepository.create).toHaveBeenCalledTimes(DEFAULT_CATEGORIES.length);
      expect(mockCategoriesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Airfare',
          description: AIRFARE_DESCRIPTION,
          color: AIRFARE_COLOR,
          icon: AIRFARE_ICON,
          organizationId: null,
          isSystem: true,
        }),
      );
      expect(mockCategoriesRepository.update).not.toHaveBeenCalled();
      expect(result.message).toContain(`${DEFAULT_CATEGORIES.length} system categories`);
    });

    it('updates an existing system category when its icon differs from the seed', async () => {
      mockCategoriesRepository.findAllSystemCategories.mockResolvedValue([
        {
          id: 'airfare-id',
          name: 'Airfare',
          description: AIRFARE_DESCRIPTION,
          color: AIRFARE_COLOR,
          icon: null,
          isSystem: true,
        },
      ]);

      await service.seedDefaultCategories();

      expect(mockCategoriesRepository.update).toHaveBeenCalledWith('airfare-id', {
        description: AIRFARE_DESCRIPTION,
        color: AIRFARE_COLOR,
        icon: AIRFARE_ICON,
      });
      expect(mockCategoriesRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Airfare' }),
      );
    });

    it('does not update when description, color and icon all match the seed', async () => {
      mockCategoriesRepository.findAllSystemCategories.mockResolvedValue([
        {
          id: 'airfare-id',
          name: 'Airfare',
          description: AIRFARE_DESCRIPTION,
          color: AIRFARE_COLOR,
          icon: AIRFARE_ICON,
          isSystem: true,
        },
      ]);

      await service.seedDefaultCategories();

      expect(mockCategoriesRepository.update).not.toHaveBeenCalledWith(
        'airfare-id',
        expect.anything(),
      );
    });
  });

  describe('seedSuperAdmin', () => {
    it('should create superadmin if it does not exist', async () => {
      mockDb.query.roles.findFirst.mockResolvedValue({ id: 'role-id' });
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await (service as any).seedSuperAdmin();

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should skip if superadmin exists', async () => {
      mockDb.query.roles.findFirst.mockResolvedValue({ id: 'role-id' });
      mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id' });

      await (service as any).seedSuperAdmin();

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should log error if SuperAdmin role is missing', async () => {
      mockDb.query.roles.findFirst.mockResolvedValue(null);
      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      await (service as any).seedSuperAdmin();

      expect(loggerSpy).toHaveBeenCalledWith('SuperAdmin role not found in database!');
    });
  });
});
