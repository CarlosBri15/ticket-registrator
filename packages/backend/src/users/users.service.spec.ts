import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersAuthorizationService } from './users-authorization.service';
import { CryptoService } from '../crypto/crypto.service';
import { RolesService } from '../roles/roles.service';
import {
  UserNotFoundException,
  UserUnauthorizedException,
  UserConflictException,
  UserBadRequestException,
} from './exceptions/users.exceptions';
import { AUTHORITY_LEVELS, permissions } from '@ticket-registrator/shared';
import { UserPayload } from '../auth/decorators/current-user.decorator';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepositoryMock: any;
  let usersAuthMock: any;
  let cryptoServiceMock: any;
  let rolesServiceMock: any;

  const mockUser: any = {
    id: 'user-1',
    name: 'John',
    surname: 'Doe',
    email: 'john@acme.com',
    username: 'john',
    roleId: 'role-id',
    companyId: 'company-1',
    role: { id: 'role-id', name: 'Employee', hierarchy: 10 },
    usersToDepartments: [
      { departmentId: 'dept-1', department: { id: 'dept-1', name: 'Sales' } },
    ],
    deletedAt: null,
  };

  const creator: UserPayload = {
    id: 'creator-1',
    roleId: 'creator-role-id',
    roleName: 'Admin' as any,
    roleHierarchy: AUTHORITY_LEVELS.COMPANY,
    companyId: 'company-1',
    departmentIds: ['dept-1'],
    permissions: [permissions.CREATE_ADMINS, permissions.EDIT_USERS],
  };

  beforeEach(async () => {
    usersRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findRoleById: jest.fn(),
      transaction: jest.fn(),
      schema: {
        users: { id: 'id', companyId: 'companyId', deletedAt: 'deletedAt' },
        roles: { name: 'name', companyId: 'companyId' },
        companies: { id: 'id' },
        departments: { id: 'id', companyId: 'companyId' },
        usersToDepartments: { userId: 'userId', departmentId: 'departmentId' },
      },
    };

    usersAuthMock = {
      validateCanCreateAdmin: jest.fn(),
      validateHierarchyAssignment: jest.fn(),
      validateDepartmentAssignment: jest.fn(),
      validateCanUpdateUser: jest.fn(),
      validateCanDeleteUser: jest.fn(),
    };

    cryptoServiceMock = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };

    rolesServiceMock = {
      getPermissionsForRoleId: jest.fn().mockResolvedValue(['view_users']),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepositoryMock },
        { provide: UsersAuthorizationService, useValue: usersAuthMock },
        { provide: CryptoService, useValue: cryptoServiceMock },
        { provide: RolesService, useValue: rolesServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const createDto: any = {
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@acme.com',
      username: 'jane',
      password: 'password',
      roleId: 'Employee',
      departmentIds: ['dept-1'],
    };

    it('should throw UserConflictException when password is missing', async () => {
      await expect(
        service.create({ ...createDto, password: undefined }, creator),
      ).rejects.toThrow(UserConflictException);
    });

    it('should throw UserBadRequestException when role not found', async () => {
      usersRepositoryMock.transaction.mockResolvedValue(null);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserBadRequestException,
      );
    });

    it('should throw UserConflictException when hierarchy check fails', async () => {
      usersRepositoryMock.transaction.mockResolvedValue({
        id: 'r1',
        hierarchy: 100,
      });
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(false);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserConflictException,
      );
    });

    it('should throw UserUnauthorizedException when creating admin without permission', async () => {
      usersRepositoryMock.transaction.mockResolvedValue({
        id: 'r1',
        hierarchy: AUTHORITY_LEVELS.COMPANY,
      });
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateCanCreateAdmin.mockReturnValue(false);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });

    it('should throw UserConflictException when company not found', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce(null); // company
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserConflictException,
      );
    });

    it('should throw UserUnauthorizedException when department assignment fails', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }); // company
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(false);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });

    it('should throw UserConflictException when some departments do not exist', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([]); // departments (empty mismatch)
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserConflictException,
      );
    });

    it('should handle duplicate email error 23505', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([{ id: 'dept-1' }]); // departments
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      usersRepositoryMock.create.mockRejectedValue({
        code: '23505',
        detail: 'email',
      });
      await expect(service.create(createDto, creator)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should handle duplicate username error 23505', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([{ id: 'dept-1' }]); // departments
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      usersRepositoryMock.create.mockRejectedValue({
        code: '23505',
        detail: 'username',
      });
      await expect(service.create(createDto, creator)).rejects.toThrow(
        'Username already exists',
      );
    });

    it('should handle generic error in create', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([{ id: 'dept-1' }]); // departments
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      usersRepositoryMock.create.mockRejectedValue(new Error('Boom'));
      await expect(service.create(createDto, creator)).rejects.toThrow(
        UserBadRequestException,
      );
    });

    it('should create user successfully superadmin case', async () => {
      const superCreator = {
        ...creator,
        roleHierarchy: AUTHORITY_LEVELS.GLOBAL,
      };
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([{ id: 'dept-1' }]); // departments
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      usersRepositoryMock.create.mockResolvedValue({ id: 'u1' });
      usersRepositoryMock.findById.mockResolvedValue(mockUser);

      const result = await service.create(
        { ...createDto, companyId: 'custom-company' },
        superCreator,
      );
      expect(result.id).toBe('user-1');
    });

    it('should handle creation without departments provided', async () => {
      usersRepositoryMock.transaction
        .mockResolvedValueOnce({ id: 'r1', hierarchy: 1 }) // role
        .mockResolvedValueOnce({ id: 'c1' }) // company
        .mockResolvedValueOnce([]); // departments
      usersAuthMock.validateHierarchyAssignment.mockReturnValue(true);
      usersAuthMock.validateDepartmentAssignment.mockReturnValue(true);
      usersRepositoryMock.create.mockResolvedValue({ id: 'u1' });
      usersRepositoryMock.findById.mockResolvedValue(mockUser);

      const result = await service.create(
        { ...createDto, departmentIds: undefined },
        creator,
      );
      expect(result.id).toBe('user-1');
    });
  });

  describe('findMe', () => {
    it('should return current user info', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      rolesServiceMock.getPermissionsForRoleId.mockResolvedValue([
        'view_users',
        'create_users',
      ]);

      const result = await service.findMe('user-1');
      expect(result.id).toBe('user-1');
      expect(result.permissions).toContain('create_users');
    });

    it('should throw UserNotFoundException if user not found', async () => {
      usersRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.findMe('user-1')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('findUserRole', () => {
    it('should return role by user id', async () => {
      usersRepositoryMock.findRoleById.mockResolvedValue({ roleId: 'r1' });
      expect(await service.findUserRole('u1')).toEqual({ roleId: 'r1' });
    });
  });

  describe('findAll', () => {
    it('should call findAll with global filters for SuperAdmin', async () => {
      const superCreator = {
        ...creator,
        roleHierarchy: AUTHORITY_LEVELS.GLOBAL,
      };
      usersRepositoryMock.findAll.mockResolvedValue([mockUser]);
      await service.findAll(superCreator);
      expect(usersRepositoryMock.findAll).toHaveBeenCalledWith([
        expect.any(Object),
      ]);
    });

    it('should call findAll with company-level filters for Admin', async () => {
      usersRepositoryMock.findAll.mockResolvedValue([mockUser]);
      await service.findAll(creator);
      expect(usersRepositoryMock.findAll).toHaveBeenCalled();
    });

    it('should call findAll with department-level filters for Manager', async () => {
      const managerCreator = {
        ...creator,
        roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
      };
      usersRepositoryMock.findAll.mockResolvedValue([mockUser]);
      await service.findAll(managerCreator);
      expect(usersRepositoryMock.findAll).toHaveBeenCalled();
    });

    it('should call findAll with self-only filters for Employee', async () => {
      const employeeCreator = { ...creator, roleHierarchy: 1 };
      usersRepositoryMock.findAll.mockResolvedValue([mockUser]);
      await service.findAll(employeeCreator);
      expect(usersRepositoryMock.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.update.mockResolvedValue(mockUser);

      const result = await service.update(
        'user-1',
        { name: 'New Name' },
        creator,
      );
      expect(result.id).toBe('user-1');
    });

    it('should hash password if provided in update', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.update.mockResolvedValue(mockUser);
      await service.update('user-1', { password: 'new' }, creator);
      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith('new');
    });

    it('should handle role update successfully', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.transaction.mockResolvedValue({
        id: 'new-r-id',
        hierarchy: 1,
      });
      usersRepositoryMock.update.mockResolvedValue(mockUser);

      await service.update('user-1', { roleId: 'Employee' } as any, creator);
      expect(usersRepositoryMock.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ roleId: 'new-r-id' }),
        undefined,
      );
    });

    it('should throw UserBadRequestException if role update finds no role', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.transaction.mockResolvedValue(null);
      await expect(
        service.update('user-1', { roleId: 'Bad' } as any, creator),
      ).rejects.toThrow(UserBadRequestException);
    });

    it('should throw UserUnauthorizedException if role update assigns higher hierarchy', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.transaction.mockResolvedValue({
        id: 'high-r',
        hierarchy: 999,
      });
      await expect(
        service.update('user-1', { roleId: 'Admin' } as any, creator),
      ).rejects.toThrow(UserUnauthorizedException);
    });

    it('should throw UserUnauthorizedException if unauthorized', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(false);
      await expect(service.update('user-1', {}, creator)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });

    it('should throw UserUnauthorizedException if self-update tries to change forbidden fields', async () => {
      usersRepositoryMock.findById.mockResolvedValue({
        ...mockUser,
        id: 'creator-1',
      });
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      await expect(
        service.update('creator-1', { companyId: 'new' } as any, creator),
      ).rejects.toThrow(UserUnauthorizedException);
    });

    it('should handle duplicate key error in update', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.update.mockRejectedValue({
        code: '23505',
        detail: 'email',
      });
      await expect(
        service.update('user-1', { email: 'dup' }, creator),
      ).rejects.toThrow('Email already exists');
    });

    it('should handle duplicate username error in update', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.update.mockRejectedValue({
        code: '23505',
        detail: 'username',
      });
      await expect(
        service.update('user-1', { username: 'dup' }, creator),
      ).rejects.toThrow('Username already exists');
    });

    it('should rethrow generic error in update', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanUpdateUser.mockReturnValue(true);
      usersRepositoryMock.update.mockRejectedValue(new Error('Fail'));
      await expect(service.update('user-1', {}, creator)).rejects.toThrow(
        'Fail',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanDeleteUser.mockReturnValue(true);

      const result = await service.remove('user-1', creator);
      expect(result.deleted).toBe(true);
      expect(usersRepositoryMock.softDelete).toHaveBeenCalledWith('user-1');
    });

    it('should throw UserNotFoundException if user not found for deletion', async () => {
      usersRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.remove('u1', creator)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw UserUnauthorizedException if hierarchy check fails for deletion', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      usersAuthMock.validateCanDeleteUser.mockReturnValue(false);
      await expect(service.remove('user-1', creator)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      usersRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      expect(await service.findByEmail('test@test.com')).toEqual(mockUser);
    });
  });

  describe('findActiveById', () => {
    it('should return user summary by id', async () => {
      usersRepositoryMock.findById.mockResolvedValue(mockUser);
      const result = await service.findActiveById('user-1');
      expect(result?.id).toBe('user-1');
      expect(result?.departmentIds).toEqual(['dept-1']);
    });

    it('should return null if user not found', async () => {
      usersRepositoryMock.findById.mockResolvedValue(null);
      expect(await service.findActiveById('u1')).toBeNull();
    });
  });
});
