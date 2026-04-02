import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsRepository } from './permissions.repository';
import { DB_CONNECTION } from '../db/db.module';

describe('PermissionsRepository', () => {
  let repository: PermissionsRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        permissions: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
        rolePermissions: {
          findFirst: jest.fn(),
        },
        userPermissions: {
          findFirst: jest.fn(),
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
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<PermissionsRepository>(PermissionsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should call findAll', async () => {
    await repository.findAll();
    expect(dbMock.query.permissions.findMany).toHaveBeenCalled();
  });

  it('should call findById', async () => {
    await repository.findById('1');
    expect(dbMock.query.permissions.findFirst).toHaveBeenCalled();
  });

  it('should call create', async () => {
    await repository.create({ name: 'test_perm', description: 'test' });
    expect(dbMock.insert).toHaveBeenCalled();
  });

  it('should call update', async () => {
    await repository.update('1', { name: 'updated' });
    expect(dbMock.update).toHaveBeenCalled();
  });

  it('should call assignToRole', async () => {
    await repository.assignToRole({ roleId: '1', permissionId: '1' });
    expect(dbMock.insert).toHaveBeenCalled();
  });

  it('should call unassignFromRole', async () => {
    await repository.unassignFromRole('1', '1');
    expect(dbMock.delete).toHaveBeenCalled();
  });

  it('should call findByName', async () => {
    await repository.findByName('view_reports');
    expect(dbMock.query.permissions.findFirst).toHaveBeenCalled();
  });

  it('should call bulkInsertPermissions', async () => {
    const insertWithConflict = jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      }),
    });
    dbMock.insert = insertWithConflict;
    const data = [{ name: 'view_reports', description: 'View reports' }];
    await repository.bulkInsertPermissions(data);
    expect(dbMock.insert).toHaveBeenCalled();
  });
});
