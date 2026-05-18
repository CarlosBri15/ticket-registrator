import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemsRepository } from './items.repository';
import { ItemNotFoundException } from './exceptions/items.exceptions';
import { ItemStatus } from '@ticket-registrator/shared';

describe('ItemsService', () => {
  let service: ItemsService;
  let itemsRepositoryMock: jest.Mocked<Partial<ItemsRepository>>;

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

  const mockIItem = {
    id: 'item-1',
    name: 'Coffee',
    amount: 4.5,
    currency: 'USD',
    status: ItemStatus.PENDING,
  };

  beforeEach(async () => {
    itemsRepositoryMock = {
      findByTicketId: jest.fn(),
      findById: jest.fn(),
      bulkCreate: jest.fn(),
      bulkDeleteByTicketId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: ItemsRepository, useValue: itemsRepositoryMock },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findByTicketId ────────────────────────────────────────────────────────────

  describe('findByTicketId', () => {
    it('should return mapped IItem array for given ticketId', async () => {
      (itemsRepositoryMock.findByTicketId as jest.Mock).mockResolvedValue([
        mockItem,
      ]);

      const result = await service.findByTicketId('ticket-1');

      expect(itemsRepositoryMock.findByTicketId).toHaveBeenCalledWith(
        'ticket-1',
      );
      expect(result).toEqual([mockIItem]);
    });

    it('should return empty array when ticket has no items', async () => {
      (itemsRepositoryMock.findByTicketId as jest.Mock).mockResolvedValue([]);

      const result = await service.findByTicketId('ticket-empty');

      expect(result).toEqual([]);
    });

    it('should return all items when ticket has multiple', async () => {
      const secondItem = {
        ...mockItem,
        id: 'item-2',
        name: 'Taxi',
        amount: 12,
      };
      (itemsRepositoryMock.findByTicketId as jest.Mock).mockResolvedValue([
        mockItem,
        secondItem,
      ]);

      const result = await service.findByTicketId('ticket-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-2');
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return mapped IItem for existing item', async () => {
      (itemsRepositoryMock.findById as jest.Mock).mockResolvedValue(mockItem);

      const result = await service.findById('item-1');

      expect(itemsRepositoryMock.findById).toHaveBeenCalledWith('item-1');
      expect(result).toEqual(mockIItem);
    });

    it('should throw ItemNotFoundException when item does not exist', async () => {
      (itemsRepositoryMock.findById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findById('missing-id')).rejects.toThrow(
        ItemNotFoundException,
      );
    });

    it('should include item id in the exception message for missing item', async () => {
      (itemsRepositoryMock.findById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findById('missing-id')).rejects.toThrow(
        'missing-id',
      );
    });
  });

  // ── bulkCreate ────────────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    it('should create items and return mapped IItem array', async () => {
      const insertData = [
        {
          ticketId: 'ticket-1',
          name: 'Coffee',
          amount: 4.5,
          currency: 'USD',
          status: ItemStatus.PENDING,
        },
      ];
      (itemsRepositoryMock.bulkCreate as jest.Mock).mockResolvedValue([
        mockItem,
      ]);

      const result = await service.bulkCreate(insertData);

      expect(itemsRepositoryMock.bulkCreate).toHaveBeenCalledWith(insertData);
      expect(result).toEqual([mockIItem]);
    });

    it('should return empty array when inserting empty list', async () => {
      (itemsRepositoryMock.bulkCreate as jest.Mock).mockResolvedValue([]);

      const result = await service.bulkCreate([]);

      expect(result).toEqual([]);
    });

    it('should map all created items', async () => {
      const items = [
        { ...mockItem, id: 'item-1' },
        { ...mockItem, id: 'item-2', name: 'Taxi', amount: 12 },
      ];
      (itemsRepositoryMock.bulkCreate as jest.Mock).mockResolvedValue(items);

      const result = await service.bulkCreate([]);

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.id)).toEqual(['item-1', 'item-2']);
    });
  });

  // ── bulkDeleteByTicketId ──────────────────────────────────────────────────────

  describe('bulkDeleteByTicketId', () => {
    it('should delete all items for given ticketId', async () => {
      (itemsRepositoryMock.bulkDeleteByTicketId as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        service.bulkDeleteByTicketId('ticket-1'),
      ).resolves.not.toThrow();

      expect(itemsRepositoryMock.bulkDeleteByTicketId).toHaveBeenCalledWith(
        'ticket-1',
      );
    });

    it('should resolve even when there are no items to delete', async () => {
      (itemsRepositoryMock.bulkDeleteByTicketId as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        service.bulkDeleteByTicketId('ticket-empty'),
      ).resolves.not.toThrow();
    });
  });
});
