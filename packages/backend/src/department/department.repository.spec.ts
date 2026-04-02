import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentRepository } from './department.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';

describe('DepartmentRepository', () => {
  let repository: DepartmentRepository;
  let dbMock: any;

  const mockDepartment = {
    id: 'dept-1',
    companyId: 'company-1',
    departmentName: 'Finance',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    dbMock = {
      query: {
        departments: { findFirst: jest.fn(), findMany: jest.fn() },
        companies: { findFirst: jest.fn() },
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
        DepartmentRepository,
        { provide: DB_CONNECTION, useValue: dbMock },
      ],
    }).compile();

    repository = module.get<DepartmentRepository>(DepartmentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ── findAllByCompany ─────────────────────────────────────────────────────────

  describe('findAllByCompany', () => {
    it('should return departments for a company', async () => {
      dbMock.query.departments.findMany.mockResolvedValue([mockDepartment]);

      const result = await repository.findAllByCompany('company-1');

      expect(dbMock.query.departments.findMany).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(result).toEqual([mockDepartment]);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return department if found', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue(mockDepartment);

      const result = await repository.findOne('company-1', 'dept-1');

      expect(result).toEqual(mockDepartment);
    });

    it('should return undefined if not found', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue(undefined);

      const result = await repository.findOne('company-1', 'non-existent');

      expect(result).toBeUndefined();
    });
  });

  // ── findByIdIncludingDeleted ──────────────────────────────────────────────────

  describe('findByIdIncludingDeleted', () => {
    it('should return deleted department', async () => {
      const deleted = { ...mockDepartment, deletedAt: new Date() };
      dbMock.query.departments.findFirst.mockResolvedValue(deleted);

      const result = await repository.findByIdIncludingDeleted(
        'company-1',
        'dept-1',
      );

      expect(result?.deletedAt).not.toBeNull();
    });
  });

  // ── findByName ───────────────────────────────────────────────────────────────

  describe('findByName', () => {
    it('should return department if name matches', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue(mockDepartment);

      const result = await repository.findByName('company-1', 'Finance');

      expect(result).toEqual(mockDepartment);
    });

    it('should return undefined if not found', async () => {
      dbMock.query.departments.findFirst.mockResolvedValue(undefined);

      const result = await repository.findByName('company-1', 'Unknown');

      expect(result).toBeUndefined();
    });
  });

  // ── findUnassigned ────────────────────────────────────────────────────────────

  describe('findUnassigned', () => {
    it('should return the unassigned department by name', async () => {
      const unassigned = { ...mockDepartment, departmentName: 'Unassigned' };
      dbMock.query.departments.findFirst.mockResolvedValue(unassigned);

      const result = await repository.findUnassigned('Unassigned');

      expect(result?.departmentName).toBe('Unassigned');
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should insert and return the created department', async () => {
      dbMock.returning.mockResolvedValue([mockDepartment]);

      const result = await repository.create({
        companyId: 'company-1',
        departmentName: 'Finance',
      });

      expect(dbMock.insert).toHaveBeenCalledWith(schema.departments);
      expect(result).toEqual(mockDepartment);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the updated department', async () => {
      const updated = { ...mockDepartment, departmentName: 'Operations' };
      dbMock.returning.mockResolvedValue([updated]);

      const result = await repository.update('dept-1', {
        departmentName: 'Operations',
      });

      expect(dbMock.update).toHaveBeenCalledWith(schema.departments);
      expect(result?.departmentName).toBe('Operations');
    });

    it('should return undefined if not found', async () => {
      dbMock.returning.mockResolvedValue([]);

      const result = await repository.update('non-existent', {
        departmentName: 'X',
      });

      expect(result).toBeUndefined();
    });
  });

  // ── findCompanyById ───────────────────────────────────────────────────────────

  describe('findCompanyById', () => {
    it('should return company if found', async () => {
      const mockCompany = {
        id: 'company-1',
        orgName: 'Acme Corp',
        deletedAt: null,
      };
      dbMock.query.companies.findFirst.mockResolvedValue(mockCompany);

      const result = await repository.findCompanyById('company-1');

      expect(dbMock.query.companies.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should return undefined if company not found', async () => {
      dbMock.query.companies.findFirst.mockResolvedValue(undefined);

      const result = await repository.findCompanyById('unknown');
      expect(result).toBeUndefined();
    });
  });

  // ── seedDefaultDepartments ────────────────────────────────────────────────────

  describe('seedDefaultDepartments', () => {
    it('should insert default departments and return them', async () => {
      dbMock.returning.mockResolvedValue([mockDepartment]);

      const result = await repository.seedDefaultDepartments('company-1');

      expect(dbMock.insert).toHaveBeenCalledWith(schema.departments);
      expect(result).toEqual([mockDepartment]);
    });
  });

  // ── transaction ───────────────────────────────────────────────────────────────

  describe('transaction', () => {
    it('should delegate to db.transaction', async () => {
      const callback = async () => 'done';
      await repository.transaction(callback);
      expect(dbMock.transaction).toHaveBeenCalledWith(callback);
    });
  });
});
