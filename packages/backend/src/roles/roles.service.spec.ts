import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { RolesAuthorizationService } from './roles-authorization.service';
import { Roles } from '@ticket-registrator/shared';
import { RoleNotFoundException, RoleConflictException } from './exceptions/roles.exceptions';

describe('RolesService', () => {
  let service: RolesService;
  let repositoryMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    repositoryMock = {
      findAllPermissions: jest.fn().mockResolvedValue([]),
      bulkInsertPermissions: jest.fn(),
      findAllSystemRoles: jest.fn().mockResolvedValue([]),
      bulkInsertRoles: jest.fn(),
      findAllRolePermissions: jest.fn().mockResolvedValue([]),
      bulkInsertRolePermissions: jest.fn(),
      findByNameAndCompany: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAllCompanyRoles: jest.fn(),
      update: jest.fn(),
      getRolePermissionsByNames: jest.fn().mockResolvedValue([]),
    };

    authServiceMock = {
      validateHierarchy: jest.fn(),
      validateCompanyAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RolesRepository, useValue: repositoryMock },
        { provide: RolesAuthorizationService, useValue: authServiceMock },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { name: 'New Role', hierarchy: 1 };
    const requester = { id: 'user-1', role: Roles.ADMIN } as any;

    it('should create a role successfully', async () => {
      repositoryMock.findByNameAndCompany.mockResolvedValue(null);
      repositoryMock.create.mockResolvedValue({ id: 'role-1', ...dto });

      const result = await service.create('comp-1', dto, requester);

      expect(result.id).toBe('role-1');
      expect(authServiceMock.validateHierarchy).toHaveBeenCalled();
      expect(repositoryMock.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if role already exists', async () => {
      repositoryMock.findByNameAndCompany.mockResolvedValue({ id: 'existing' });

      await expect(service.create('comp-1', dto, requester))
        .rejects.toThrow(RoleConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a role if found', async () => {
      repositoryMock.findById.mockResolvedValue({ id: '1', companyId: 'comp-1' });

      const result = await service.findOne('1', 'comp-1');

      expect(result.id).toBe('1');
      expect(authServiceMock.validateCompanyAccess).toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findOne('1', 'comp-1'))
        .rejects.toThrow(RoleNotFoundException);
    });
  });

  describe('softDelete', () => {
    const requester = { id: 'user-1', role: Roles.ADMIN } as any;

    it('should soft delete successfully', async () => {
      repositoryMock.findById.mockResolvedValue({ id: '1', companyId: 'comp-1', hierarchy: 1, isSystem: false });

      const result = await service.softDelete('1', 'comp-1', requester);

      expect(result.deleted).toBe(true);
      expect(repositoryMock.update).toHaveBeenCalledWith('1', { isVisible: false });
    });

    it('should throw if role is system', async () => {
      repositoryMock.findById.mockResolvedValue({ id: '1', companyId: 'comp-1', hierarchy: 1, isSystem: true });

      await expect(service.softDelete('1', 'comp-1', requester))
        .rejects.toThrow();
    });

    it('should throw RoleNotFoundException when role companyId does not match', async () => {
      repositoryMock.findById.mockResolvedValue({ id: '1', companyId: 'other-company', hierarchy: 1, isSystem: false });

      await expect(service.softDelete('1', 'comp-1', requester))
        .rejects.toThrow(RoleNotFoundException);
    });

    it('should throw RoleNotFoundException when role not found in softDelete', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.softDelete('1', 'comp-1', requester))
        .rejects.toThrow(RoleNotFoundException);
    });
  });

  describe('findAll', () => {
    it('should call findAllCompanyRoles when companyId is provided', async () => {
      repositoryMock.findAllCompanyRoles.mockResolvedValue([{ id: 'role-1' }] as any);

      const result = await service.findAll('comp-1');

      expect(repositoryMock.findAllCompanyRoles).toHaveBeenCalledWith('comp-1');
      expect(result).toHaveLength(1);
    });

    it('should call findAllSystemRoles when companyId is null', async () => {
      repositoryMock.findAllSystemRoles.mockResolvedValue([{ id: 'sys-role' }] as any);

      const result = await service.findAll(null);

      expect(repositoryMock.findAllSystemRoles).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('getPermissionsForRoles', () => {
    it('should collect unique permission names from all roles', async () => {
      const rolesWithPerms = [
        {
          id: 'r1',
          rolePermissions: [
            { permission: { name: 'view_reports' } },
            { permission: { name: 'create_reports' } },
          ],
        },
        {
          id: 'r2',
          rolePermissions: [
            { permission: { name: 'view_reports' } }, // duplicate
            { permission: { name: 'edit_tickets' } },
          ],
        },
      ];
      repositoryMock.getRolePermissionsByNames.mockResolvedValue(rolesWithPerms as any);

      const result = await service.getPermissionsForRoles(['Employee', 'Manager'], 'comp-1');

      expect(result).toHaveLength(3);
      expect(result).toContain('view_reports');
      expect(result).toContain('create_reports');
      expect(result).toContain('edit_tickets');
    });

    it('should return empty array when no roles have permissions', async () => {
      repositoryMock.getRolePermissionsByNames.mockResolvedValue([]);

      const result = await service.getPermissionsForRoles(['Unknown'], null);
      expect(result).toEqual([]);
    });
  });

  describe('getPermissionsForRoleId', () => {
    it('should return permissions for the given role id', async () => {
      const roleWithPerms = {
        id: 'r1',
        rolePermissions: [
          { permission: { name: 'view_reports' } },
          { permission: { name: 'create_reports' } },
        ],
      };
      repositoryMock.getRolePermissionsById = jest.fn().mockResolvedValue(roleWithPerms);

      const result = await service.getPermissionsForRoleId('r1', null);
      expect(result).toEqual(['view_reports', 'create_reports']);
    });

    it('should return empty array when role is not found', async () => {
      repositoryMock.getRolePermissionsById = jest.fn().mockResolvedValue(undefined);

      const result = await service.getPermissionsForRoleId('unknown', null);
      expect(result).toEqual([]);
    });
  });
});
