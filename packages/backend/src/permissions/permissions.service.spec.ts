import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsAuthorizationService } from './permissions-authorization.service';
import {
  PermissionNotFoundException,
  PermissionConflictException,
} from './exceptions/permissions.exceptions';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repository: jest.Mocked<PermissionsRepository>;
  let authService: jest.Mocked<PermissionsAuthorizationService>;

  beforeEach(async () => {
    const repositoryMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      assignToRole: jest.fn(),
      unassignFromRole: jest.fn(),
      bulkInsertPermissions: jest.fn(),
    };

    const authServiceMock = {
      validateCanManageCatalog: jest.fn(),
      validateCanAssignPermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PermissionsRepository, useValue: repositoryMock },
        { provide: PermissionsAuthorizationService, useValue: authServiceMock },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get(PermissionsRepository);
    authService = module.get(PermissionsAuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll();
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a permission if found', async () => {
      const perm = { id: '1', name: 'p1' } as any;
      repository.findById.mockResolvedValue(perm);
      const result = await service.findOne('1');
      expect(result).toEqual(perm);
    });

    it('should throw if not found', async () => {
      repository.findById.mockResolvedValue(undefined);
      await expect(service.findOne('1')).rejects.toThrow(
        PermissionNotFoundException,
      );
    });
  });

  describe('create', () => {
    const requester = { id: 'u1', permissions: [] } as any;

    it('should create a permission', async () => {
      authService.validateCanManageCatalog.mockReturnValue(true as any);
      repository.findByName.mockResolvedValue(undefined);
      repository.create.mockResolvedValue({ id: '1', name: 'p1' } as any);

      await service.create({ name: 'p1', description: 'd' } as any, requester);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw if name already exists', async () => {
      authService.validateCanManageCatalog.mockReturnValue(true as any);
      repository.findByName.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.create({ name: 'p1' } as any, requester),
      ).rejects.toThrow(PermissionConflictException);
    });
  });

  describe('update', () => {
    const requester = { id: 'u1', permissions: [] } as any;

    it('should update a permission', async () => {
      authService.validateCanManageCatalog.mockReturnValue(true as any);
      repository.findById.mockResolvedValue({ id: '1', name: 'old' } as any);
      repository.update.mockResolvedValue({ id: '1', name: 'new' } as any);

      await service.update('1', { name: 'new' } as any, requester);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    const requester = { id: 'u1', permissions: [] } as any;

    it('should soft delete a permission', async () => {
      authService.validateCanManageCatalog.mockReturnValue(true as any);
      repository.findById.mockResolvedValue({ id: '1' } as any);
      repository.update.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      } as any);

      await service.softDelete('1', requester);
      expect(repository.update).toHaveBeenCalledWith('1', {
        deletedAt: expect.any(Date),
      });
    });
  });

  describe('assignToRole', () => {
    const requester = { id: 'u1', permissions: [] } as any;

    it('should assign permission to role', async () => {
      authService.validateCanAssignPermissions.mockReturnValue(true as any);
      repository.findById.mockResolvedValue({ id: 'p1' } as any);
      repository.assignToRole.mockResolvedValue({ id: 'm1' } as any);

      await service.assignToRole(
        { roleId: 'r1', permissionId: 'p1' } as any,
        requester,
      );
      expect(repository.assignToRole).toHaveBeenCalled();
    });
  });

  describe('unassignFromRole', () => {
    const requester = { id: 'u1', permissions: [] } as any;

    it('should unassign permission from role', async () => {
      authService.validateCanAssignPermissions.mockReturnValue(true as any);
      repository.unassignFromRole.mockResolvedValue(undefined);

      const result = await service.unassignFromRole(
        'role-1',
        'perm-1',
        requester,
      );
      expect(repository.unassignFromRole).toHaveBeenCalledWith(
        'role-1',
        'perm-1',
      );
      expect(result).toEqual({ unassigned: true });
    });
  });

  describe('seedDefaultPermissions', () => {
    it('should call bulkInsertPermissions with all shared permissions', async () => {
      repository.bulkInsertPermissions.mockResolvedValue(undefined);

      await service.seedDefaultPermissions();

      expect(repository.bulkInsertPermissions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            description: expect.any(String),
          }),
        ]),
      );
    });
  });
});
