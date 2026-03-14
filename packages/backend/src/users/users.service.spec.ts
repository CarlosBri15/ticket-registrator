import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DB_CONNECTION } from '../db/db.module';
import { CryptoService } from '../crypto/crypto.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AUTHORITY_LEVELS, permissions } from '@ticket-registrator/shared';

describe('UsersService', () => {
  let service: UsersService;
  let dbMock: any;
  let cryptoServiceMock: any;

  const mockRole = { id: 'role-id', name: 'Employee', hierarchy: 10, companyId: null };
  const mockCompany = { id: 'company-1', name: 'Acme' };
  const mockDepartment = { id: 'dept-1', name: 'Sales', companyId: 'company-1' };
  const mockUser: any = {
    id: 'user-1',
    name: 'John',
    surname: 'Doe',
    email: 'john@acme.com',
    username: 'john',
    roleId: 'role-id',
    companyId: 'company-1',
    role: mockRole,
    usersToDepartments: [{ departmentId: 'dept-1', department: mockDepartment }],
    deletedAt: null,
  };

  const creatorBase = {
    roleId: 'creator-role-id',
    roleName: 'Admin' as any,
    roleHierarchy: AUTHORITY_LEVELS.COMPANY ?? 4,
    companyId: 'company-1',
    departmentIds: ['dept-1'],
    permissions: [permissions.CREATE_ADMINS],
  };

  beforeEach(async () => {
    dbMock = {
      query: {
        users: { findFirst: jest.fn(), findMany: jest.fn() },
        roles: { findFirst: jest.fn() },
        companies: { findFirst: jest.fn() },
        departments: { findMany: jest.fn() },
      },
      transaction: jest.fn(),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([mockUser]) }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    cryptoServiceMock = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DB_CONNECTION, useValue: dbMock },
        { provide: CryptoService, useValue: cryptoServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto: any = {
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@acme.com',
      username: 'jane',
      password: 'secret',
      roleId: 'Employee',
      departmentIds: ['dept-1'],
    };

    it('should throw ConflictException when password is missing', async () => {
      await expect(service.create({ ...createDto, password: undefined }, creatorBase))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when role not found', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue(null);
      await expect(service.create(createDto, creatorBase)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when creator hierarchy <= target hierarchy', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: AUTHORITY_LEVELS.COMPANY ?? 4 });
      await expect(service.create(createDto, creatorBase)).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException when creating admin without permission', async () => {
      const adminRole = { ...mockRole, hierarchy: AUTHORITY_LEVELS.COMPANY ?? 4, name: 'Admin' };
      dbMock.query.roles.findFirst.mockResolvedValue(adminRole);
      const creatorWithoutPerm = { ...creatorBase, roleHierarchy: AUTHORITY_LEVELS.GLOBAL ?? 5, permissions: [] };
      await expect(service.create(createDto, creatorWithoutPerm)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when target company does not exist', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(null);
      await expect(service.create(createDto, creatorBase)).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException when manager assigns department they dont belong to', async () => {
      const managerCreator = {
        ...creatorBase,
        roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT ?? 2,
        departmentIds: ['dept-2'],
      };
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      await expect(service.create({ ...createDto, departmentIds: ['dept-1'] }, managerCreator))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when departments dont exist in company', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([]); // returns 0, but dto has 1
      await expect(service.create(createDto, creatorBase)).rejects.toThrow(ConflictException);
    });

    it('should create user successfully', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'user-1' }]) }),
          }),
        };
        return cb(tx);
      });
      dbMock.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.create(createDto, creatorBase);
      expect(result.id).toBe('user-1');
    });

    it('should create user successfully as superadmin with custom companyId', async () => {
      const superCreator = { ...creatorBase, roleHierarchy: AUTHORITY_LEVELS.GLOBAL ?? 5, companyId: 'company-1' };
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'user-1' }]) }),
          }),
        };
        return cb(tx);
      });
      dbMock.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.create({ ...createDto, companyId: 'company-1' }, superCreator);
      expect(result.id).toBe('user-1');
    });

    it('should throw ConflictException on duplicate email (pg error 23505)', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);
      const pgError: any = new Error('duplicate key');
      pgError.code = '23505';
      pgError.detail = 'Key (email)=(x) already exists';
      dbMock.transaction.mockRejectedValue(pgError);

      await expect(service.create(createDto, creatorBase)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on duplicate username (pg error 23505)', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);
      const pgError: any = new Error('duplicate key');
      pgError.code = '23505';
      pgError.detail = 'Key (username)=(x) already exists';
      dbMock.transaction.mockRejectedValue(pgError);

      await expect(service.create(createDto, creatorBase)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on generic db error', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);
      dbMock.transaction.mockRejectedValue(new Error('some db error'));

      await expect(service.create(createDto, creatorBase)).rejects.toThrow(BadRequestException);
    });

    it('should create user without departments', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue({ ...mockRole, hierarchy: 1 });
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);
      dbMock.query.departments.findMany.mockResolvedValue([]);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'user-1' }]) }),
          }),
        };
        return cb(tx);
      });
      dbMock.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.create({ ...createDto, departmentIds: [] }, creatorBase);
      expect(result.id).toBe('user-1');
    });
  });

  // ── findMe ────────────────────────────────────────────────────────────────────

  describe('findMe', () => {
    it('should return mapped user when found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(mockUser);
      const result = await service.findMe('user-1');
      expect(result.id).toBe('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      await expect(service.findMe('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findUserRole ──────────────────────────────────────────────────────────────

  describe('findUserRole', () => {
    it('should return roleId when user exists', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ roleId: 'role-id' });
      const result = await service.findUserRole('user-1');
      expect(result).toEqual({ roleId: 'role-id' });
    });

    it('should return undefined when user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(undefined);
      const result = await service.findUserRole('user-1');
      expect(result).toBeUndefined();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    const requesterBase = {
      id: 'user-1',
      roleId: 'role-id',
      roleName: 'Admin' as any,
      roleHierarchy: AUTHORITY_LEVELS.GLOBAL ?? 5,
      companyId: 'company-1',
      departmentIds: ['dept-1'],
      permissions: [],
    };

    it('should return all users for global requester', async () => {
      dbMock.query.users.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll(requesterBase);
      expect(result).toHaveLength(1);
    });

    it('should filter by company for company-level requester', async () => {
      const companyRequester = { ...requesterBase, roleHierarchy: AUTHORITY_LEVELS.COMPANY ?? 4 };
      dbMock.query.users.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll(companyRequester);
      expect(result).toHaveLength(1);
    });

    it('should filter by departments for department-level requester', async () => {
      const deptRequester = { ...requesterBase, roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT ?? 2 };
      dbMock.query.users.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll(deptRequester);
      expect(result).toHaveLength(1);
    });

    it('should filter to only self for below-department requester', async () => {
      const employeeRequester = { ...requesterBase, roleHierarchy: 1 };
      dbMock.query.users.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll(employeeRequester);
      expect(result).toHaveLength(1);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────────

  describe('update', () => {
    const requesterBase = {
      id: 'user-1',
      roleId: 'role-id',
      roleName: 'Admin' as any,
      roleHierarchy: AUTHORITY_LEVELS.COMPANY ?? 4,
      companyId: 'company-1',
      departmentIds: ['dept-1'],
      permissions: [permissions.EDIT_USERS],
    };

    it('should throw NotFoundException when user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      await expect(service.update('user-1', {}, requesterBase)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when self-update without EDIT_USERS permission', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ ...mockUser, id: 'user-1' });
      const requesterNoPerm = { ...requesterBase, permissions: [] };
      await expect(service.update('user-1', {}, requesterNoPerm)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when self-update tries to change roles field', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ ...mockUser, id: 'user-1' });
      await expect(service.update('user-1', { roles: 'new-role' } as any, requesterBase)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when self-update tries to change departmentIds', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ ...mockUser, id: 'user-1' });
      await expect(service.update('user-1', { departmentIds: ['d1'] } as any, requesterBase)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when low-level tries to update other user', async () => {
      const otherUser = { ...mockUser, id: 'user-2' };
      dbMock.query.users.findFirst.mockResolvedValue(otherUser);
      const lowRequester = { ...requesterBase, roleHierarchy: 1, id: 'user-1' };
      await expect(service.update('user-2', {}, lowRequester)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when updating user outside company', async () => {
      const otherUser = { ...mockUser, id: 'user-2', companyId: 'company-2', role: mockRole };
      dbMock.query.users.findFirst.mockResolvedValue(otherUser);
      const sameCompanyRequester = { ...requesterBase, id: 'user-1', companyId: 'company-1' };
      await expect(service.update('user-2', {}, sameCompanyRequester)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when updating user with equal or higher role', async () => {
      const targetRole = { ...mockRole, hierarchy: AUTHORITY_LEVELS.COMPANY ?? 4 };
      const otherUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: targetRole };
      dbMock.query.users.findFirst.mockResolvedValue(otherUser);
      await expect(service.update('user-2', {}, requesterBase)).rejects.toThrow(ForbiddenException);
    });

    it('should update basic fields successfully', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(targetUser)  // initial findFirst
        .mockResolvedValueOnce(targetUser); // findMe call
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { roles: { findFirst: jest.fn().mockResolvedValue(null) }, departments: { findMany: jest.fn().mockResolvedValue([]) } },
          delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
          insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
        };
        return cb(tx);
      });

      const result = await service.update('user-2', { name: 'Updated' }, requesterBase);
      expect(result).toBeDefined();
    });

    it('should hash password when provided in update', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(targetUser)
        .mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
        };
        return cb(tx);
      });

      await service.update('user-2', { password: 'newpass' }, requesterBase);
      expect(cryptoServiceMock.hashPassword).toHaveBeenCalledWith('newpass');
    });

    it('should update roleId in transaction', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(targetUser)
        .mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const newRole = { id: 'new-role-id', hierarchy: 1 };
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { roles: { findFirst: jest.fn().mockResolvedValue(newRole) } },
        };
        return cb(tx);
      });

      await service.update('user-2', { roleId: 'Employee' } as any, requesterBase);
      expect(dbMock.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when new role not found in transaction', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst.mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { roles: { findFirst: jest.fn().mockResolvedValue(null) } },
        };
        return cb(tx);
      });

      await expect(service.update('user-2', { roleId: 'Unknown' } as any, requesterBase)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when assigning role >= requester hierarchy', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst.mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const highRole = { id: 'high-id', hierarchy: AUTHORITY_LEVELS.COMPANY ?? 4 };
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { roles: { findFirst: jest.fn().mockResolvedValue(highRole) } },
        };
        return cb(tx);
      });

      await expect(service.update('user-2', { roleId: 'Admin' } as any, requesterBase)).rejects.toThrow(ForbiddenException);
    });

    it('should update departments in transaction', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(targetUser)
        .mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { departments: { findMany: jest.fn().mockResolvedValue([mockDepartment]) } },
          delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
          insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
        };
        return cb(tx);
      });

      await service.update('user-2', { departmentIds: ['dept-1'] } as any, requesterBase);
      expect(dbMock.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid departments in transaction', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst.mockResolvedValueOnce(targetUser);
      dbMock.transaction.mockImplementation(async (cb: any) => {
        const tx = {
          update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
          query: { departments: { findMany: jest.fn().mockResolvedValue([]) } }, // 0 returned, 1 expected
        };
        return cb(tx);
      });

      await expect(service.update('user-2', { departmentIds: ['dept-invalid'] } as any, requesterBase)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on duplicate email in update (pg 23505)', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst.mockResolvedValueOnce(targetUser);
      const pgError: any = new Error('dup');
      pgError.code = '23505';
      pgError.detail = 'Key (email)=(x)';
      dbMock.transaction.mockRejectedValue(pgError);

      await expect(service.update('user-2', { email: 'dup@x.com' }, requesterBase)).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-pg errors in update', async () => {
      const targetUser = { ...mockUser, id: 'user-2', companyId: 'company-1', role: { ...mockRole, hierarchy: 1 } };
      dbMock.query.users.findFirst.mockResolvedValueOnce(targetUser);
      const err = new ForbiddenException('test');
      dbMock.transaction.mockRejectedValue(err);

      await expect(service.update('user-2', { name: 'x' }, requesterBase)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe('remove', () => {
    const requester = {
      id: 'admin',
      roleHierarchy: AUTHORITY_LEVELS.COMPANY ?? 4,
    };

    it('should soft delete user successfully', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        role: { hierarchy: 1 },
        deletedAt: null,
      });

      const result = await service.remove('user-1', requester);
      expect(result).toEqual({ deleted: true });
      expect(dbMock.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      await expect(service.remove('user-1', requester)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user already deleted', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ ...mockUser, deletedAt: new Date() });
      await expect(service.remove('user-1', requester)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when target has >= hierarchy', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        role: { hierarchy: AUTHORITY_LEVELS.COMPANY ?? 4 },
        deletedAt: null,
      });
      await expect(service.remove('user-1', requester)).rejects.toThrow(ForbiddenException);
    });

    it('should handle user with no role (hierarchy 0)', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        role: null,
        deletedAt: null,
      });
      const superRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.GLOBAL ?? 5 };

      const result = await service.remove('user-1', superRequester);
      expect(result).toEqual({ deleted: true });
    });
  });

  // ── findByEmail ───────────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@acme.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      const result = await service.findByEmail('noone@acme.com');
      expect(result).toBeNull();
    });
  });

  // ── findActiveById ────────────────────────────────────────────────────────────

  describe('findActiveById', () => {
    it('should return active user data', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        role: { hierarchy: 2 },
        usersToDepartments: [{ departmentId: 'dept-1' }],
      });
      const result = await service.findActiveById('user-1');
      expect(result).toEqual({
        id: 'user-1',
        roleHierarchy: 2,
        companyId: 'company-1',
        departmentIds: ['dept-1'],
      });
    });

    it('should return null when user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValue(null);
      const result = await service.findActiveById('user-1');
      expect(result).toBeNull();
    });

    it('should handle user with no role', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        role: null,
        usersToDepartments: [],
      });
      const result = await service.findActiveById('user-1');
      expect(result?.roleHierarchy).toBe(0);
    });
  });
});
