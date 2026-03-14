import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { DepartmentAuthorizationService } from './department-authorization.service';
import {
  DepartmentNotFoundException,
  DepartmentConflictException,
  DepartmentAlreadyDeletedException,
  DepartmentUnauthorizedException,
} from './exceptions/department.exceptions';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repositoryMock: jest.Mocked<Partial<DepartmentRepository>>;
  let authServiceMock: jest.Mocked<Partial<DepartmentAuthorizationService>>;

  const companyRequester = {
    id: 'user-admin',
    roleHierarchy: AUTHORITY_LEVELS.COMPANY,
    companyId: 'company-1',
    departmentIds: [],
  } as any;

  const lowRequester = {
    id: 'user-dept',
    roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
    companyId: 'company-1',
    departmentIds: ['dept-1'],
  } as any;

  const mockDepartment = {
    id: 'dept-1',
    companyId: 'company-1',
    departmentName: 'Finance',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    repositoryMock = {
      findAllByCompany: jest.fn(),
      findOne: jest.fn(),
      findByIdIncludingDeleted: jest.fn(),
      findByName: jest.fn(),
      findUnassigned: jest.fn(),
      findCompanyById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      seedDefaultDepartments: jest.fn(),
      transaction: jest.fn(),
    };

    authServiceMock = {
      validateCompanyAccess: jest.fn(),
      validateCanManage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        { provide: DepartmentRepository, useValue: repositoryMock },
        { provide: DepartmentAuthorizationService, useValue: authServiceMock },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { name: 'Marketing' } as any;

    it('should create and return mapped department', async () => {
      (repositoryMock.findCompanyById as jest.Mock).mockResolvedValue({ id: 'company-1' });
      (repositoryMock.findByName as jest.Mock).mockResolvedValue(undefined);
      (repositoryMock.create as jest.Mock).mockResolvedValue({ ...mockDepartment, departmentName: 'Marketing' });

      const result = await service.create(companyRequester, 'company-1', dto);

      expect(authServiceMock.validateCanManage).toHaveBeenCalledWith(companyRequester, 'company-1');
      expect(result.name).toBe('Marketing');
    });

    it('should throw DepartmentNotFoundException if company not found', async () => {
      (repositoryMock.findCompanyById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.create(companyRequester, 'company-1', dto)).rejects.toThrow(
        DepartmentNotFoundException,
      );
    });

    it('should throw DepartmentConflictException if department name already exists', async () => {
      (repositoryMock.findCompanyById as jest.Mock).mockResolvedValue({ id: 'company-1' });
      (repositoryMock.findByName as jest.Mock).mockResolvedValue(mockDepartment);

      await expect(service.create(companyRequester, 'company-1', { name: 'Finance' } as any)).rejects.toThrow(
        DepartmentConflictException,
      );
    });

    it('should throw DepartmentUnauthorizedException if not authorized', async () => {
      (authServiceMock.validateCanManage as jest.Mock).mockImplementation(() => {
        throw new DepartmentUnauthorizedException();
      });

      await expect(service.create(lowRequester, 'company-1', dto)).rejects.toThrow(
        DepartmentUnauthorizedException,
      );
    });
  });

  // ── findAllByCompany ─────────────────────────────────────────────────────────

  describe('findAllByCompany', () => {
    it('should return mapped departments', async () => {
      (repositoryMock.findAllByCompany as jest.Mock).mockResolvedValue([mockDepartment]);

      const result = await service.findAllByCompany(companyRequester, 'company-1');

      expect(authServiceMock.validateCompanyAccess).toHaveBeenCalledWith(companyRequester, 'company-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Finance');
    });

    it('should throw DepartmentUnauthorizedException if not authorized', async () => {
      (authServiceMock.validateCompanyAccess as jest.Mock).mockImplementation(() => {
        throw new DepartmentUnauthorizedException();
      });

      await expect(service.findAllByCompany(lowRequester, 'other-company')).rejects.toThrow(
        DepartmentUnauthorizedException,
      );
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return mapped department if found', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(mockDepartment);

      const result = await service.findOne(companyRequester, 'company-1', 'dept-1');

      expect(result.id).toBe('dept-1');
      expect(result.name).toBe('Finance');
    });

    it('should throw DepartmentNotFoundException if not found', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne(companyRequester, 'company-1', 'unknown')).rejects.toThrow(
        DepartmentNotFoundException,
      );
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return mapped department', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(mockDepartment);
      (repositoryMock.update as jest.Mock).mockResolvedValue({ ...mockDepartment, departmentName: 'Operations' });

      const result = await service.update(companyRequester, 'company-1', 'dept-1', { name: 'Operations' } as any);

      expect(authServiceMock.validateCanManage).toHaveBeenCalledWith(companyRequester, 'company-1');
      expect(result.name).toBe('Operations');
    });

    it('should return existing department if dto has no name', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(mockDepartment);

      const result = await service.update(companyRequester, 'company-1', 'dept-1', {} as any);

      expect(repositoryMock.update).not.toHaveBeenCalled();
      expect(result.name).toBe('Finance');
    });

    it('should throw DepartmentNotFoundException if department not found', async () => {
      (repositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.update(companyRequester, 'company-1', 'unknown', { name: 'X' } as any),
      ).rejects.toThrow(DepartmentNotFoundException);
    });
  });

  // ── softDelete ───────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should soft delete and return { deleted: true }', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue(mockDepartment);
      (repositoryMock.findUnassigned as jest.Mock).mockResolvedValue({ id: 'unassigned-dept' });
      (repositoryMock.transaction as jest.Mock).mockImplementation((cb) =>
        cb({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockResolvedValue([]),
          query: {
            usersToDepartments: { findMany: jest.fn().mockResolvedValue([]) },
          },
        }),
      );

      const result = await service.softDelete(companyRequester, 'company-1', 'dept-1');

      expect(authServiceMock.validateCanManage).toHaveBeenCalledWith(companyRequester, 'company-1');
      expect(result).toEqual({ deleted: true });
    });

    it('should throw DepartmentNotFoundException if department not found', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue(undefined);

      await expect(service.softDelete(companyRequester, 'company-1', 'unknown')).rejects.toThrow(
        DepartmentNotFoundException,
      );
    });

    it('should throw DepartmentAlreadyDeletedException if already deleted', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue({
        ...mockDepartment,
        deletedAt: new Date(),
      });

      await expect(service.softDelete(companyRequester, 'company-1', 'dept-1')).rejects.toThrow(
        DepartmentAlreadyDeletedException,
      );
    });

    it('should throw DepartmentConflictException if Unassigned department not found', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue(mockDepartment);
      (repositoryMock.findUnassigned as jest.Mock).mockResolvedValue(undefined);

      await expect(service.softDelete(companyRequester, 'company-1', 'dept-1')).rejects.toThrow(
        DepartmentConflictException,
      );
    });
  });
});
