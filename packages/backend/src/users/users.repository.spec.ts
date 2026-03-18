import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { DB_CONNECTION } from '../db/db.module';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        users: { findFirst: jest.fn(), findMany: jest.fn() },
      },
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call db.query.users.findFirst', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ id: 'u1' });
      const result = await repository.findById('u1');
      expect(result).toEqual({ id: 'u1' });
      expect(dbMock.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should call db.query.users.findFirst', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ id: 'u1' });
      const result = await repository.findByEmail('test@test.com');
      expect(result).toEqual({ id: 'u1' });
      expect(dbMock.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should call db.query.users.findFirst', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ id: 'u1' });
      const result = await repository.findByUsername('user1');
      expect(result).toEqual({ id: 'u1' });
      expect(dbMock.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call db.query.users.findMany', async () => {
      dbMock.query.users.findMany.mockResolvedValue([{ id: 'u1' }]);
      const result = await repository.findAll([]);
      expect(result).toEqual([{ id: 'u1' }]);
      expect(dbMock.query.users.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should handle transaction and insert', async () => {
      const txMock = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'u1' }]),
      };
      dbMock.transaction.mockImplementation(async (cb: any) => cb(txMock));

      const result = await repository.create({ email: 'test@test.com' } as any, ['dept-1']);
      expect(result).toEqual({ id: 'u1' });
      expect(txMock.insert).toHaveBeenCalledTimes(2); // user and usersToDepartments
    });

    it('should handle creation without departments', async () => {
        const txMock = {
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ id: 'u1' }]),
        };
        dbMock.transaction.mockImplementation(async (cb: any) => cb(txMock));
  
        const result = await repository.create({ email: 'test@test.com' } as any);
        expect(result).toEqual({ id: 'u1' });
        expect(txMock.insert).toHaveBeenCalledTimes(1);
      });
  });

  describe('update', () => {
    it('should update user and departments', async () => {
      const txMock = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        query: { users: { findFirst: jest.fn().mockResolvedValue({ id: 'u1' }) } },
      };
      dbMock.transaction.mockImplementation(async (cb: any) => cb(txMock));

      const result = await repository.update('u1', { name: 'New' }, ['dept-1']);
      expect(result).toEqual({ id: 'u1' });
      expect(txMock.update).toHaveBeenCalled();
      expect(txMock.delete).toHaveBeenCalled();
      expect(txMock.insert).toHaveBeenCalled();
    });

    it('should only update user if departments not provided', async () => {
        const txMock = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          query: { users: { findFirst: jest.fn().mockResolvedValue({ id: 'u1' }) } },
        };
        dbMock.transaction.mockImplementation(async (cb: any) => cb(txMock));
  
        const result = await repository.update('u1', { name: 'New' });
        expect(result).toEqual({ id: 'u1' });
        expect(txMock.update).toHaveBeenCalled();
      });
  });

  describe('softDelete', () => {
    it('should call db.update', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'u1' }]);
      const result = await repository.softDelete('u1');
      expect(result).toEqual([{ id: 'u1' }]);
      expect(dbMock.update).toHaveBeenCalled();
    });
  });

  describe('findRoleById', () => {
    it('should call findFirst with columns', async () => {
      dbMock.query.users.findFirst.mockResolvedValue({ roleId: 'r1' });
      const result = await repository.findRoleById('u1');
      expect(result).toEqual({ roleId: 'r1' });
    });
  });

  describe('transaction', () => {
    it('should call db.transaction', async () => {
      const cb = async () => {};
      await repository.transaction(cb as any);
      expect(dbMock.transaction).toHaveBeenCalledWith(cb);
    });
  });
});
