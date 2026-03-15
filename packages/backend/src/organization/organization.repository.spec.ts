import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationRepository } from './organization.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';

describe('OrganizationRepository', () => {
  let repository: OrganizationRepository;
  let dbMock: any;

  const mockCompany = {
    id: 'company-1',
    orgName: 'Acme Corp',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    dbMock = {
      query: {
        companies: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<OrganizationRepository>(OrganizationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all non-deleted companies', async () => {
      dbMock.query.companies.findMany.mockResolvedValue([mockCompany]);

      const result = await repository.findAll();

      expect(dbMock.query.companies.findMany).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(result).toEqual([mockCompany]);
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return company if found and not deleted', async () => {
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);

      const result = await repository.findById('company-1');

      expect(dbMock.query.companies.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(result).toEqual(mockCompany);
    });

    it('should return undefined if not found', async () => {
      dbMock.query.companies.findFirst.mockResolvedValue(undefined);

      const result = await repository.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  // ── findByIdIncludingDeleted ─────────────────────────────────────────────────

  describe('findByIdIncludingDeleted', () => {
    it('should return company even if deleted', async () => {
      const deletedCompany = { ...mockCompany, deletedAt: new Date() };
      dbMock.query.companies.findFirst.mockResolvedValue(deletedCompany);

      const result = await repository.findByIdIncludingDeleted('company-1');

      expect(result?.deletedAt).not.toBeNull();
    });
  });

  // ── findByName ───────────────────────────────────────────────────────────────

  describe('findByName', () => {
    it('should return company if name matches', async () => {
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);

      const result = await repository.findByName('Acme Corp');

      expect(result).toEqual(mockCompany);
    });

    it('should return undefined if no company with that name', async () => {
      dbMock.query.companies.findFirst.mockResolvedValue(undefined);

      const result = await repository.findByName('Unknown');

      expect(result).toBeUndefined();
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should insert and return the created company', async () => {
      dbMock.returning.mockResolvedValue([mockCompany]);

      const result = await repository.create({ orgName: 'Acme Corp' });

      expect(dbMock.insert).toHaveBeenCalledWith(schema.companies);
      expect(result).toEqual(mockCompany);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the updated company', async () => {
      const updated = { ...mockCompany, orgName: 'New Name' };
      dbMock.returning.mockResolvedValue([updated]);

      const result = await repository.update('company-1', {
        orgName: 'New Name',
      });

      expect(dbMock.update).toHaveBeenCalledWith(schema.companies);
      expect(result?.orgName).toBe('New Name');
    });

    it('should return undefined if company not found', async () => {
      dbMock.returning.mockResolvedValue([]);

      const result = await repository.update('non-existent', { orgName: 'X' });

      expect(result).toBeUndefined();
    });
  });

  // ── transaction ───────────────────────────────────────────────────────────────

  describe('transaction', () => {
    it('should delegate to db.transaction', async () => {
      const callback = async () => 'result';
      await repository.transaction(callback);
      expect(dbMock.transaction).toHaveBeenCalledWith(callback);
    });
  });
});
