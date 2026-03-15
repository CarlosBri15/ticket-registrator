import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { DB_CONNECTION } from '../db/db.module';

describe('RolesRepository', () => {
  let repository: RolesRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        roles: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
        permissions: {
          findMany: jest.fn(),
        },
        rolePermissions: {
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: '1' }]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: '1' }]),
          }),
        }),
      }),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<RolesRepository>(RolesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should call findAllSystemRoles', async () => {
    await repository.findAllSystemRoles();
    expect(dbMock.query.roles.findMany).toHaveBeenCalled();
  });

  it('should call findById', async () => {
    await repository.findById('1');
    expect(dbMock.query.roles.findFirst).toHaveBeenCalled();
  });

  it('should call create', async () => {
    await repository.create({ name: 'Role', hierarchy: 1 } as any);
    expect(dbMock.insert).toHaveBeenCalled();
  });

  describe('findByNameAndCompany', () => {
    it('should call db.query.roles.findFirst', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue(undefined);
      await repository.findByNameAndCompany('Admin', 'comp-1');
      expect(dbMock.query.roles.findFirst).toHaveBeenCalled();
    });
  });

  describe('findAllCompanyRoles', () => {
    it('should call db.query.roles.findMany', async () => {
      dbMock.query.roles.findMany.mockResolvedValue([]);
      await repository.findAllCompanyRoles('comp-1');
      expect(dbMock.query.roles.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should call db.update with schema.roles', async () => {
      await repository.update('role-1', { deletedAt: new Date() });
      expect(dbMock.update).toHaveBeenCalled();
    });
  });

  describe('findAllPermissions', () => {
    it('should call db.query.permissions.findMany', async () => {
      dbMock.query.permissions.findMany.mockResolvedValue([]);
      await repository.findAllPermissions();
      expect(dbMock.query.permissions.findMany).toHaveBeenCalled();
    });
  });

  describe('findAllRolePermissions', () => {
    it('should call db.query.rolePermissions.findMany', async () => {
      dbMock.query.rolePermissions.findMany.mockResolvedValue([]);
      await repository.findAllRolePermissions(null);
      expect(dbMock.query.rolePermissions.findMany).toHaveBeenCalled();
    });
  });

  describe('getRolePermissionsByNames', () => {
    it('should call db.query.roles.findMany with role names', async () => {
      dbMock.query.roles.findMany.mockResolvedValue([]);
      await repository.getRolePermissionsByNames(
        ['Admin', 'Employee'],
        'comp-1',
      );
      expect(dbMock.query.roles.findMany).toHaveBeenCalled();
    });
  });

  describe('getRolePermissionsById', () => {
    it('should call db.query.roles.findFirst with role id', async () => {
      dbMock.query.roles.findFirst.mockResolvedValue(undefined);
      await repository.getRolePermissionsById('role-1', null);
      expect(dbMock.query.roles.findFirst).toHaveBeenCalled();
    });
  });

  describe('bulkInsertPermissions', () => {
    it('should call db.insert when data is not empty', async () => {
      await repository.bulkInsertPermissions([{ name: 'view_reports' }] as any);
      expect(dbMock.insert).toHaveBeenCalled();
    });

    it('should not call db.insert when data is empty', async () => {
      dbMock.insert.mockClear();
      await repository.bulkInsertPermissions([]);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });

  describe('bulkInsertRoles', () => {
    it('should call db.insert when data is not empty', async () => {
      await repository.bulkInsertRoles([{ name: 'Custom' } as any]);
      expect(dbMock.insert).toHaveBeenCalled();
    });

    it('should not call db.insert when data is empty', async () => {
      dbMock.insert.mockClear();
      await repository.bulkInsertRoles([]);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('should delegate to db.transaction', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      dbMock.transaction.mockImplementation((cb: any) => cb(dbMock));
      await repository.transaction(callback);
      expect(dbMock.transaction).toHaveBeenCalled();
    });
  });

  describe('bulkInsertRolePermissions', () => {
    it('should call db.insert when data is not empty', async () => {
      await repository.bulkInsertRolePermissions([
        { roleId: 'r1', permissionId: 'p1', companyId: null },
      ]);
      expect(dbMock.insert).toHaveBeenCalled();
    });

    it('should not call db.insert when data is empty', async () => {
      dbMock.insert.mockClear();
      await repository.bulkInsertRolePermissions([]);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });
});
