import { Test, TestingModule } from '@nestjs/testing';
import { TicketsRepository } from './tickets.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';

describe('TicketsRepository', () => {
  let repository: TicketsRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        tickets: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      transaction: jest.fn().mockImplementation((cb) => cb(dbMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<TicketsRepository>(TicketsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ─── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should call db.query.tickets.findFirst with the correct id', async () => {
      dbMock.query.tickets.findFirst.mockResolvedValue({ id: 'ticket-1' });
      const result = await repository.findById('ticket-1');
      expect(dbMock.query.tickets.findFirst).toHaveBeenCalled();
      expect(result?.id).toBe('ticket-1');
    });

    it('should return undefined when ticket is not found', async () => {
      dbMock.query.tickets.findFirst.mockResolvedValue(undefined);
      const result = await repository.findById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  // ─── findByReportId ────────────────────────────────────────────────────────

  describe('findByReportId', () => {
    it('should return a list of tickets for a report', async () => {
      dbMock.query.tickets.findMany.mockResolvedValue([{ id: 'ticket-1' }]);
      const result = await repository.findByReportId('report-1');
      expect(dbMock.query.tickets.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no tickets exist for a report', async () => {
      dbMock.query.tickets.findMany.mockResolvedValue([]);
      const result = await repository.findByReportId('report-x');
      expect(result).toEqual([]);
    });
  });

  // ─── findByImageId ─────────────────────────────────────────────────────────

  describe('findByImageId', () => {
    it('should call db.query.tickets.findFirst with the imageId', async () => {
      dbMock.query.tickets.findFirst.mockResolvedValue({
        id: 'ticket-1',
        imageId: 'img-1',
      });
      const result = await repository.findByImageId('img-1');
      expect(dbMock.query.tickets.findFirst).toHaveBeenCalled();
      expect(result?.imageId).toBe('img-1');
    });

    it('should return undefined when no ticket matches the imageId', async () => {
      dbMock.query.tickets.findFirst.mockResolvedValue(undefined);
      const result = await repository.findByImageId('missing-img');
      expect(result).toBeUndefined();
    });
  });

  // ─── findAllFingerprints ───────────────────────────────────────────────────

  describe('findAllFingerprints', () => {
    it('should return only id and imageId columns', async () => {
      dbMock.query.tickets.findMany.mockResolvedValue([
        { id: 'ticket-1', imageId: 'img-1' },
        { id: 'ticket-2', imageId: 'img-2' },
      ]);
      const result = await repository.findAllFingerprints();
      expect(dbMock.query.tickets.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('imageId');
    });

    it('should return empty array when no tickets exist', async () => {
      dbMock.query.tickets.findMany.mockResolvedValue([]);
      const result = await repository.findAllFingerprints();
      expect(result).toEqual([]);
    });
  });

  // ─── findSemanticDuplicate ─────────────────────────────────────────────────

  describe('findSemanticDuplicate', () => {
    it('should return a ticket when a semantic duplicate exists', async () => {
      const date = new Date('2024-01-01');
      dbMock.query.tickets.findFirst.mockResolvedValue({ id: 'ticket-1' });
      const result = await repository.findSemanticDuplicate(
        date,
        50.0,
        'Coffee Shop',
      );
      expect(dbMock.query.tickets.findFirst).toHaveBeenCalled();
      expect(result?.id).toBe('ticket-1');
    });

    it('should return undefined when no semantic duplicate exists', async () => {
      dbMock.query.tickets.findFirst.mockResolvedValue(undefined);
      const result = await repository.findSemanticDuplicate(
        new Date(),
        0,
        'Unknown',
      );
      expect(result).toBeUndefined();
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should insert ticket and items in a transaction', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);
      const data = { reportId: 'report-1' } as any;
      const items = [{ name: 'item-1' }] as any;

      const result = await repository.create(data, items);

      expect(dbMock.insert).toHaveBeenCalledWith(schema.tickets);
      expect(dbMock.insert).toHaveBeenCalledWith(schema.items);
      expect(result.id).toBe('ticket-1');
    });

    it('should create ticket without inserting items if none are provided', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-2' }]);
      const data = { reportId: 'report-1' } as any;

      const result = await repository.create(data);

      expect(dbMock.insert).toHaveBeenCalledWith(schema.tickets);
      expect(dbMock.insert).not.toHaveBeenCalledWith(schema.items);
      expect(result.id).toBe('ticket-2');
    });

    it('should create ticket without inserting items if items array is empty', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-3' }]);
      const data = { reportId: 'report-1' } as any;

      const result = await repository.create(data, []);

      expect(dbMock.insert).not.toHaveBeenCalledWith(schema.items);
      expect(result.id).toBe('ticket-3');
    });
  });

  // ─── updateWithHistory ─────────────────────────────────────────────────────

  describe('updateWithHistory', () => {
    const historyData = {
      ticketId: 'ticket-1',
      reportId: 'report-1',
      version: 1,
      oldSnapshot: {},
      newSnapshot: {},
    } as any;

    it('should insert history and update ticket in a transaction', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);

      await repository.updateWithHistory(
        'ticket-1',
        { status: 'APPROVED' } as any,
        historyData,
      );

      expect(dbMock.insert).toHaveBeenCalledWith(schema.ticketHistories);
      expect(dbMock.update).toHaveBeenCalledWith(schema.tickets);
    });

    it('should delete and re-insert items when itemsToUpdate is provided', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);
      const items = [{ name: 'Item 1', amount: 10 }] as any;

      await repository.updateWithHistory(
        'ticket-1',
        {} as any,
        historyData,
        items,
      );

      expect(dbMock.delete).toHaveBeenCalledWith(schema.items);
      expect(dbMock.insert).toHaveBeenCalledWith(schema.items);
    });

    it('should delete items but NOT re-insert when itemsToUpdate is empty array', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);

      await repository.updateWithHistory(
        'ticket-1',
        {} as any,
        historyData,
        [],
      );

      expect(dbMock.delete).toHaveBeenCalledWith(schema.items);
      expect(dbMock.insert).not.toHaveBeenCalledWith(schema.items);
    });

    it('should NOT touch items when itemsToUpdate is undefined', async () => {
      dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);
      dbMock.delete.mockClear();

      await repository.updateWithHistory(
        'ticket-1',
        {} as any,
        historyData,
        undefined,
      );

      expect(dbMock.delete).not.toHaveBeenCalledWith(schema.items);
    });
  });

  // ─── softDelete ────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should insert history and set deletedAt on the ticket', async () => {
      await repository.softDelete('ticket-1', {
        ticketId: 'ticket-1',
        reportId: 'report-1',
      } as any);

      expect(dbMock.insert).toHaveBeenCalledWith(schema.ticketHistories);
      expect(dbMock.update).toHaveBeenCalledWith(schema.tickets);
      expect(dbMock.set).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });
  });

  // ─── transaction ───────────────────────────────────────────────────────────

  describe('transaction', () => {
    it('should delegate to db.transaction and return the callback result', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      dbMock.transaction.mockImplementation((cb: any) => cb(dbMock));
      const result = await repository.transaction(callback);
      expect(dbMock.transaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(dbMock);
    });
  });
});
