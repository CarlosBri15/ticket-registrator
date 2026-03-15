import { Test, TestingModule } from '@nestjs/testing';
import { ReportsRepository } from './reports.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

describe('ReportsRepository', () => {
  let repository: ReportsRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        reports: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<ReportsRepository>(ReportsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call db.query.reports.findFirst', async () => {
      await repository.findById('report-1');
      expect(dbMock.query.reports.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });
  });

  describe('create', () => {
    it('should insert a report and return it', async () => {
      const mockData = { name: 'New Report' } as any;
      dbMock.returning.mockResolvedValue([{ id: 'new-id', ...mockData }]);

      const result = await repository.create(mockData);
      expect(dbMock.insert).toHaveBeenCalledWith(schema.reports);
      expect(result.id).toBe('new-id');
    });
  });

  describe('updateWithCondition', () => {
    it('should update report with combined condition', async () => {
      const mockData = { name: 'Updated' } as any;
      dbMock.returning.mockResolvedValue([{ id: 'report-1', ...mockData }]);

      const condition = eq(schema.reports.status, 'CREATED');
      await repository.updateWithCondition('report-1', mockData, condition);

      expect(dbMock.update).toHaveBeenCalledWith(schema.reports);
      expect(dbMock.where).toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('should delegate to db.transaction', async () => {
      const callback = async () => 'result';
      await repository.transaction(callback);
      expect(dbMock.transaction).toHaveBeenCalledWith(callback);
    });
  });

  describe('findWithFilters', () => {
    it('should call db.select and return data with total', async () => {
      const mockRow = { report: { id: 'r1', name: 'Trip' } };
      const countRow = { count: '2' };

      let selectCall = 0;
      dbMock.select.mockImplementation(() => {
        selectCall++;
        if (selectCall === 1) {
          const chain: any = {};
          chain.from = jest.fn().mockReturnValue(chain);
          chain.innerJoin = jest.fn().mockReturnValue(chain);
          chain.where = jest.fn().mockReturnValue(chain);
          chain.orderBy = jest.fn().mockReturnValue(chain);
          chain.limit = jest.fn().mockReturnValue(chain);
          chain.offset = jest.fn().mockResolvedValue([mockRow]);
          return chain;
        } else {
          const chain: any = {};
          chain.from = jest.fn().mockReturnValue(chain);
          chain.innerJoin = jest.fn().mockReturnValue(chain);
          chain.where = jest.fn().mockResolvedValue([countRow]);
          return chain;
        }
      });

      const result = await repository.findWithFilters({ where: {} as any });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('findByUserId', () => {
    it('should call db.query.reports.findMany', async () => {
      dbMock.query.reports.findMany.mockResolvedValue([{ id: 'r1' }]);
      const result = await repository.findByUserId('user-1');
      expect(dbMock.query.reports.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOverlapping', () => {
    it('should call db.query.reports.findFirst', async () => {
      dbMock.query.reports.findFirst.mockResolvedValue(undefined);
      const result = await repository.findOverlapping(
        'user-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
      expect(dbMock.query.reports.findFirst).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return overlapping report if found', async () => {
      dbMock.query.reports.findFirst.mockResolvedValue({ id: 'overlap-1' });
      const result = await repository.findOverlapping(
        'user-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
      expect(result).toEqual({ id: 'overlap-1' });
    });
  });

  describe('update', () => {
    it('should update report fields and return updated report', async () => {
      const mockData = { name: 'Updated Name' } as any;
      dbMock.returning.mockResolvedValue([{ id: 'report-1', ...mockData }]);

      const result = await repository.update('report-1', mockData);
      expect(dbMock.update).toHaveBeenCalledWith(schema.reports);
      expect(result?.id).toBe('report-1');
    });
  });

  describe('softDelete', () => {
    it('should update isVisible to false', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'r1', isVisible: false }]);
      await repository.softDelete('r1');
      expect(dbMock.update).toHaveBeenCalledWith(schema.reports);
    });
  });
});
