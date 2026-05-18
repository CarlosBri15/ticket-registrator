import { Test, TestingModule } from '@nestjs/testing';
import { ItemsRepository } from './items.repository';
import { DB_CONNECTION } from '../db/db.module';
import { ItemStatus } from '@ticket-registrator/shared';

describe('ItemsRepository', () => {
  let repository: ItemsRepository;
  let dbMock: any;

  const mockItem = {
    id: 'item-1',
    ticketId: 'ticket-1',
    name: 'Coffee',
    amount: 4.5,
    currency: 'USD',
    status: ItemStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    dbMock = {
      query: {
        items: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<ItemsRepository>(ItemsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ── findByTicketId ────────────────────────────────────────────────────────────

  describe('findByTicketId', () => {
    it('should return items for a given ticketId', async () => {
      dbMock.query.items.findMany.mockResolvedValue([mockItem]);

      const result = await repository.findByTicketId('ticket-1');

      expect(dbMock.query.items.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual([mockItem]);
    });

    it('should return empty array when no items exist for ticket', async () => {
      dbMock.query.items.findMany.mockResolvedValue([]);

      const result = await repository.findByTicketId('ticket-empty');

      expect(result).toEqual([]);
    });

    it('should return multiple items for a ticket', async () => {
      const secondItem = { ...mockItem, id: 'item-2', name: 'Taxi' };
      dbMock.query.items.findMany.mockResolvedValue([mockItem, secondItem]);

      const result = await repository.findByTicketId('ticket-1');

      expect(result).toHaveLength(2);
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return item when found', async () => {
      dbMock.query.items.findFirst.mockResolvedValue(mockItem);

      const result = await repository.findById('item-1');

      expect(dbMock.query.items.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual(mockItem);
    });

    it('should return undefined when item not found', async () => {
      dbMock.query.items.findFirst.mockResolvedValue(undefined);

      const result = await repository.findById('missing-id');

      expect(result).toBeUndefined();
    });
  });

  // ── bulkCreate ────────────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    it('should insert items and return created records', async () => {
      const returningMock = jest.fn().mockResolvedValue([mockItem]);
      const valuesMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      const insertData = [
        {
          ticketId: 'ticket-1',
          name: 'Coffee',
          amount: 4.5,
          currency: 'USD',
          status: ItemStatus.PENDING,
        },
      ];

      const result = await repository.bulkCreate(insertData);

      expect(dbMock.insert).toHaveBeenCalled();
      expect(result).toEqual([mockItem]);
    });

    it('should return empty array without calling DB when data is empty', async () => {
      const result = await repository.bulkCreate([]);

      expect(dbMock.insert).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should insert multiple items at once', async () => {
      const createdItems = [
        { ...mockItem, id: 'item-1' },
        { ...mockItem, id: 'item-2', name: 'Taxi' },
      ];
      const returningMock = jest.fn().mockResolvedValue(createdItems);
      const valuesMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      const insertData = [
        {
          ticketId: 'ticket-1',
          name: 'Coffee',
          amount: 4.5,
          currency: 'USD',
          status: ItemStatus.PENDING,
        },
        {
          ticketId: 'ticket-1',
          name: 'Taxi',
          amount: 12,
          currency: 'USD',
          status: ItemStatus.PENDING,
        },
      ];

      const result = await repository.bulkCreate(insertData);

      expect(result).toHaveLength(2);
    });
  });

  // ── bulkDeleteByTicketId ──────────────────────────────────────────────────────

  describe('bulkDeleteByTicketId', () => {
    it('should delete all items for a given ticketId', async () => {
      const whereMock = jest.fn().mockResolvedValue(undefined);
      dbMock.delete.mockReturnValue({ where: whereMock });

      await repository.bulkDeleteByTicketId('ticket-1');

      expect(dbMock.delete).toHaveBeenCalled();
      expect(whereMock).toHaveBeenCalled();
    });

    it('should resolve without error when no items exist for ticket', async () => {
      const whereMock = jest.fn().mockResolvedValue(undefined);
      dbMock.delete.mockReturnValue({ where: whereMock });

      await expect(
        repository.bulkDeleteByTicketId('ticket-empty'),
      ).resolves.not.toThrow();
    });
  });
});
