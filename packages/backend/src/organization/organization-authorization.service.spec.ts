import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { OrganizationUnauthorizedException } from './exceptions/organization.exceptions';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';

describe('OrganizationAuthorizationService', () => {
  let service: OrganizationAuthorizationService;

  const globalRequester = {
    id: 'user-global',
    roleHierarchy: AUTHORITY_LEVELS.GLOBAL,
    companyId: 'company-1',
  } as any;

  const companyRequester = {
    id: 'user-admin',
    roleHierarchy: AUTHORITY_LEVELS.COMPANY,
    companyId: 'company-1',
  } as any;

  const departmentRequester = {
    id: 'user-dept',
    roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
    companyId: 'company-1',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationAuthorizationService],
    }).compile();

    service = module.get<OrganizationAuthorizationService>(OrganizationAuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── validateCanCreate ────────────────────────────────────────────────────────

  describe('validateCanCreate', () => {
    it('should allow global admin to create', () => {
      expect(() => service.validateCanCreate(globalRequester)).not.toThrow();
    });

    it('should throw OrganizationUnauthorizedException for company admin', () => {
      expect(() => service.validateCanCreate(companyRequester)).toThrow(OrganizationUnauthorizedException);
    });

    it('should throw OrganizationUnauthorizedException for department user', () => {
      expect(() => service.validateCanCreate(departmentRequester)).toThrow(OrganizationUnauthorizedException);
    });
  });

  // ── validateCanViewAll ───────────────────────────────────────────────────────

  describe('validateCanViewAll', () => {
    it('should allow global admin to view all', () => {
      expect(() => service.validateCanViewAll(globalRequester)).not.toThrow();
    });

    it('should throw OrganizationUnauthorizedException for non-global', () => {
      expect(() => service.validateCanViewAll(companyRequester)).toThrow(OrganizationUnauthorizedException);
    });
  });

  // ── validateCanUpdate ────────────────────────────────────────────────────────

  describe('validateCanUpdate', () => {
    it('should allow global admin to update any company', () => {
      expect(() => service.validateCanUpdate(globalRequester, 'any-company-id')).not.toThrow();
    });

    it('should allow company admin to update their own company', () => {
      expect(() => service.validateCanUpdate(companyRequester, 'company-1')).not.toThrow();
    });

    it('should throw OrganizationUnauthorizedException if company admin tries to update another company', () => {
      expect(() => service.validateCanUpdate(companyRequester, 'other-company')).toThrow(
        OrganizationUnauthorizedException,
      );
    });

    it('should throw OrganizationUnauthorizedException for department user', () => {
      expect(() => service.validateCanUpdate(departmentRequester, 'company-1')).toThrow(
        OrganizationUnauthorizedException,
      );
    });
  });

  // ── validateCanDelete ────────────────────────────────────────────────────────

  describe('validateCanDelete', () => {
    it('should allow global admin to delete', () => {
      expect(() => service.validateCanDelete(globalRequester)).not.toThrow();
    });

    it('should throw OrganizationUnauthorizedException for company admin', () => {
      expect(() => service.validateCanDelete(companyRequester)).toThrow(OrganizationUnauthorizedException);
    });

    it('should throw OrganizationUnauthorizedException for department user', () => {
      expect(() => service.validateCanDelete(departmentRequester)).toThrow(OrganizationUnauthorizedException);
    });
  });
});
