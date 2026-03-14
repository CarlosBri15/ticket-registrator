import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { DepartmentService } from '../department/department.service';
import { CryptoService } from '../crypto/crypto.service';
import {
  OrganizationNotFoundException,
  OrganizationConflictException,
  OrganizationAlreadyDeletedException,
  OrganizationUnauthorizedException,
} from './exceptions/organization.exceptions';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repositoryMock: jest.Mocked<Partial<OrganizationRepository>>;
  let authServiceMock: jest.Mocked<Partial<OrganizationAuthorizationService>>;
  let cryptoServiceMock: jest.Mocked<Partial<CryptoService>>;

  const globalRequester = {
    id: 'user-global',
    roleHierarchy: AUTHORITY_LEVELS.GLOBAL,
    companyId: 'company-1',
    departmentIds: [],
  } as any;

  const companyRequester = {
    id: 'user-admin',
    roleHierarchy: AUTHORITY_LEVELS.COMPANY,
    companyId: 'company-1',
    departmentIds: [],
  } as any;

  const mockCompany = {
    id: 'company-1',
    orgName: 'Acme Corp',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    repositoryMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdIncludingDeleted: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      transaction: jest.fn(),
    };

    authServiceMock = {
      validateCanCreate: jest.fn(),
      validateCanViewAll: jest.fn(),
      validateCanUpdate: jest.fn(),
      validateCanDelete: jest.fn(),
    };

    cryptoServiceMock = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: OrganizationRepository, useValue: repositoryMock },
        { provide: OrganizationAuthorizationService, useValue: authServiceMock },
        { provide: DepartmentService, useValue: {} },
        { provide: CryptoService, useValue: cryptoServiceMock },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return mapped organizations', async () => {
      (repositoryMock.findAll as jest.Mock).mockResolvedValue([mockCompany]);

      const result = await service.findAll(globalRequester);

      expect(authServiceMock.validateCanViewAll).toHaveBeenCalledWith(globalRequester);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('company-1');
      expect(result[0].name).toBe('Acme Corp');
    });

    it('should throw OrganizationUnauthorizedException if not authorized', async () => {
      (authServiceMock.validateCanViewAll as jest.Mock).mockImplementation(() => {
        throw new OrganizationUnauthorizedException();
      });

      await expect(service.findAll(companyRequester)).rejects.toThrow(OrganizationUnauthorizedException);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return mapped organization if found', async () => {
      (repositoryMock.findById as jest.Mock).mockResolvedValue(mockCompany);

      const result = await service.findOne('company-1');

      expect(result.id).toBe('company-1');
      expect(result.name).toBe('Acme Corp');
    });

    it('should throw OrganizationNotFoundException if not found', async () => {
      (repositoryMock.findById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne('unknown-id')).rejects.toThrow(OrganizationNotFoundException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto = { name: 'New Name' } as any;

    it('should update and return mapped organization', async () => {
      (repositoryMock.findById as jest.Mock).mockResolvedValue(mockCompany);
      (repositoryMock.update as jest.Mock).mockResolvedValue({ ...mockCompany, orgName: 'New Name' });

      const result = await service.update(globalRequester, 'company-1', dto);

      expect(authServiceMock.validateCanUpdate).toHaveBeenCalledWith(globalRequester, 'company-1');
      expect(result.name).toBe('New Name');
    });

    it('should return existing organization if dto has no name', async () => {
      (repositoryMock.findById as jest.Mock).mockResolvedValue(mockCompany);

      const result = await service.update(globalRequester, 'company-1', {} as any);

      expect(repositoryMock.update).not.toHaveBeenCalled();
      expect(result.name).toBe('Acme Corp');
    });

    it('should throw OrganizationNotFoundException if company not found', async () => {
      (repositoryMock.findById as jest.Mock).mockResolvedValue(undefined);

      await expect(service.update(globalRequester, 'unknown-id', dto)).rejects.toThrow(
        OrganizationNotFoundException,
      );
    });

    it('should throw OrganizationUnauthorizedException if not authorized', async () => {
      (authServiceMock.validateCanUpdate as jest.Mock).mockImplementation(() => {
        throw new OrganizationUnauthorizedException();
      });

      await expect(service.update(companyRequester, 'other-company', dto)).rejects.toThrow(
        OrganizationUnauthorizedException,
      );
    });
  });

  // ── softDelete ───────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should soft delete and return { deleted: true }', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue(mockCompany);
      (repositoryMock.transaction as jest.Mock).mockImplementation((cb) =>
        cb({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([]),
          query: {
            users: { findMany: jest.fn().mockResolvedValue([]) },
            reports: { findMany: jest.fn().mockResolvedValue([]) },
          },
        }),
      );

      const result = await service.softDelete(globalRequester, 'company-1');

      expect(authServiceMock.validateCanDelete).toHaveBeenCalledWith(globalRequester);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw OrganizationNotFoundException if company not found', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue(undefined);

      await expect(service.softDelete(globalRequester, 'unknown-id')).rejects.toThrow(
        OrganizationNotFoundException,
      );
    });

    it('should throw OrganizationAlreadyDeletedException if already deleted', async () => {
      (repositoryMock.findByIdIncludingDeleted as jest.Mock).mockResolvedValue({
        ...mockCompany,
        deletedAt: new Date(),
      });

      await expect(service.softDelete(globalRequester, 'company-1')).rejects.toThrow(
        OrganizationAlreadyDeletedException,
      );
    });

    it('should throw OrganizationUnauthorizedException if not authorized', async () => {
      (authServiceMock.validateCanDelete as jest.Mock).mockImplementation(() => {
        throw new OrganizationUnauthorizedException();
      });

      await expect(service.softDelete(companyRequester, 'company-1')).rejects.toThrow(
        OrganizationUnauthorizedException,
      );
    });
  });

  // ── onboard ──────────────────────────────────────────────────────────────────

  describe('onboard', () => {
    const dto = {
      company: { name: 'New Corp' },
      admins: [{ name: 'Jane', surname: 'Doe', email: 'jane@newcorp.com' }],
    } as any;

    it('should throw OrganizationConflictException if company name already exists', async () => {
      (repositoryMock.findByName as jest.Mock).mockResolvedValue(mockCompany);

      await expect(service.onboard(globalRequester, dto)).rejects.toThrow(OrganizationConflictException);
    });

    it('should throw OrganizationUnauthorizedException if requester is not global', async () => {
      (authServiceMock.validateCanCreate as jest.Mock).mockImplementation(() => {
        throw new OrganizationUnauthorizedException();
      });

      await expect(service.onboard(companyRequester, dto)).rejects.toThrow(OrganizationUnauthorizedException);
    });

    it('should throw BadRequestException if unassigned department not found', async () => {
      (repositoryMock.findByName as jest.Mock).mockResolvedValue(undefined);
      (repositoryMock.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({
          query: {
            departments: { findFirst: jest.fn().mockResolvedValue(null) },
            roles: { findFirst: jest.fn() },
            users: { findFirst: jest.fn() },
          },
          insert: jest.fn(),
        }),
      );

      await expect(service.onboard(globalRequester, dto)).rejects.toThrow(BadRequestException);
    });
  });
});
