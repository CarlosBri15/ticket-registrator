import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { DB_CONNECTION } from '../db/db.module';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let dbMock: any;

  const mockCategory = {
    id: 'cat-1',
    name: 'Travel',
    description: 'Travel expenses',
    organizationId: 'org-1',
    isSystem: false,
    color: null,
    icon: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    dbMock = {
      query: {
        categories: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should insert a category and return it', async () => {
      const returningMock = jest.fn().mockResolvedValue([mockCategory]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      const result = await repository.create({
        name: 'Travel',
        description: 'Travel expenses',
        organizationId: 'org-1',
      });

      expect(dbMock.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Travel',
          description: 'Travel expenses',
          organizationId: 'org-1',
          isSystem: false,
        }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('should default isSystem to false when not provided', async () => {
      const returningMock = jest
        .fn()
        .mockResolvedValue([{ ...mockCategory, isSystem: false }]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      await repository.create({
        name: 'Travel',
        description: 'Travel expenses',
        organizationId: 'org-1',
      });

      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({ isSystem: false }),
      );
    });

    it('should set isSystem to true when explicitly provided', async () => {
      const systemCategory = { ...mockCategory, isSystem: true };
      const returningMock = jest.fn().mockResolvedValue([systemCategory]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      const result = await repository.create({
        name: 'System',
        description: 'System category',
        organizationId: null,
        isSystem: true,
      });

      expect(result.isSystem).toBe(true);
    });
  });

  // ── createMany ────────────────────────────────────────────────────────────────

  describe('createMany', () => {
    it('should insert multiple categories and return them', async () => {
      const secondCategory = { ...mockCategory, id: 'cat-2', name: 'Food' };
      const returningMock = jest
        .fn()
        .mockResolvedValue([mockCategory, secondCategory]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      const result = await repository.createMany([
        { name: 'Travel', description: 'Travel expenses', organizationId: 'org-1' },
        { name: 'Food', description: 'Food expenses', organizationId: 'org-1' },
      ]);

      expect(dbMock.insert).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should default isSystem to false for each item when not provided', async () => {
      const returningMock = jest.fn().mockResolvedValue([mockCategory]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      await repository.createMany([
        { name: 'Travel', description: 'Travel expenses', organizationId: 'org-1' },
      ]);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ isSystem: false }),
        ]),
      );
    });

    it('should preserve explicit isSystem value in batch insert', async () => {
      const systemCat = { ...mockCategory, isSystem: true };
      const returningMock = jest.fn().mockResolvedValue([systemCat]);
      const valuesMock = jest.fn().mockReturnValue({ returning: returningMock });
      dbMock.insert.mockReturnValue({ values: valuesMock });

      await repository.createMany([
        {
          name: 'System',
          description: 'Sys desc',
          organizationId: null,
          isSystem: true,
        },
      ]);

      expect(valuesMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ isSystem: true }),
        ]),
      );
    });
  });

  // ── findByOrganization ────────────────────────────────────────────────────────

  describe('findByOrganization', () => {
    it('should return categories for a given organizationId', async () => {
      dbMock.query.categories.findMany.mockResolvedValue([mockCategory]);

      const result = await repository.findByOrganization('org-1');

      expect(dbMock.query.categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual([mockCategory]);
    });

    it('should query with null organizationId path', async () => {
      const systemCat = { ...mockCategory, organizationId: null, isSystem: true };
      dbMock.query.categories.findMany.mockResolvedValue([systemCat]);

      const result = await repository.findByOrganization(null);

      expect(dbMock.query.categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual([systemCat]);
    });

    it('should return empty array when no categories match', async () => {
      dbMock.query.categories.findMany.mockResolvedValue([]);

      const result = await repository.findByOrganization('org-unknown');

      expect(result).toEqual([]);
    });
  });

  // ── findAllSystemCategories ───────────────────────────────────────────────────

  describe('findAllSystemCategories', () => {
    it('should return all system categories', async () => {
      const systemCat = { ...mockCategory, isSystem: true, organizationId: null };
      dbMock.query.categories.findMany.mockResolvedValue([systemCat]);

      const result = await repository.findAllSystemCategories();

      expect(dbMock.query.categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual([systemCat]);
    });

    it('should return empty array when no system categories exist', async () => {
      dbMock.query.categories.findMany.mockResolvedValue([]);

      const result = await repository.findAllSystemCategories();

      expect(result).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return the category when found', async () => {
      dbMock.query.categories.findFirst.mockResolvedValue(mockCategory);

      const result = await repository.findById('cat-1');

      expect(dbMock.query.categories.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('should return undefined when category does not exist', async () => {
      dbMock.query.categories.findFirst.mockResolvedValue(undefined);

      const result = await repository.findById('not-found');

      expect(result).toBeUndefined();
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete the category by id', async () => {
      const whereMock = jest.fn().mockResolvedValue(undefined);
      dbMock.delete.mockReturnValue({ where: whereMock });

      await repository.delete('cat-1');

      expect(dbMock.delete).toHaveBeenCalled();
      expect(whereMock).toHaveBeenCalled();
    });

    it('should resolve without error when category does not exist', async () => {
      const whereMock = jest.fn().mockResolvedValue(undefined);
      dbMock.delete.mockReturnValue({ where: whereMock });

      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  // ── softDelete ────────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should return true when the record was found and soft-deleted', async () => {
      const returningMock = jest
        .fn()
        .mockResolvedValue([{ ...mockCategory, deletedAt: new Date() }]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      dbMock.update.mockReturnValue({ set: setMock });

      const result = await repository.softDelete('cat-1');

      expect(dbMock.update).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
      expect(result).toBe(true);
    });

    it('should return false when no record was updated (id not found)', async () => {
      const returningMock = jest.fn().mockResolvedValue([]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      dbMock.update.mockReturnValue({ set: setMock });

      const result = await repository.softDelete('non-existent');

      expect(result).toBe(false);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update category fields and return the updated record', async () => {
      const updated = { ...mockCategory, name: 'Updated Travel' };
      const returningMock = jest.fn().mockResolvedValue([updated]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      dbMock.update.mockReturnValue({ set: setMock });

      const result = await repository.update('cat-1', { name: 'Updated Travel' });

      expect(dbMock.update).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Travel',
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual(updated);
    });

    it('should return undefined when no record was found to update', async () => {
      const returningMock = jest.fn().mockResolvedValue([]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      dbMock.update.mockReturnValue({ set: setMock });

      const result = await repository.update('non-existent', { name: 'X' });

      expect(result).toBeUndefined();
    });

    it('should merge updatedAt into the set payload regardless of provided data', async () => {
      const returningMock = jest.fn().mockResolvedValue([mockCategory]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      dbMock.update.mockReturnValue({ set: setMock });

      await repository.update('cat-1', { description: 'new desc' });

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ updatedAt: expect.any(Date) }),
      );
    });
  });
});
