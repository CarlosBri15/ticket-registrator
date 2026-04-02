import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentAuthorizationService } from './department-authorization.service';
import { DepartmentUnauthorizedException } from './exceptions/department.exceptions';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';

describe('DepartmentAuthorizationService', () => {
  let service: DepartmentAuthorizationService;

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

  const deptRequester = {
    id: 'user-dept',
    roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
    companyId: 'company-1',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentAuthorizationService],
    }).compile();

    service = module.get<DepartmentAuthorizationService>(
      DepartmentAuthorizationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── validateCompanyAccess ────────────────────────────────────────────────────

  describe('validateCompanyAccess', () => {
    it('should allow global admin to access any company', () => {
      expect(() =>
        service.validateCompanyAccess(globalRequester, 'other-company'),
      ).not.toThrow();
    });

    it('should allow user to access their own company', () => {
      expect(() =>
        service.validateCompanyAccess(companyRequester, 'company-1'),
      ).not.toThrow();
    });

    it('should allow department user to access their own company', () => {
      expect(() =>
        service.validateCompanyAccess(deptRequester, 'company-1'),
      ).not.toThrow();
    });

    it('should throw DepartmentUnauthorizedException for different company', () => {
      expect(() =>
        service.validateCompanyAccess(companyRequester, 'other-company'),
      ).toThrow(DepartmentUnauthorizedException);
    });

    it('should throw DepartmentUnauthorizedException for dept user in different company', () => {
      expect(() =>
        service.validateCompanyAccess(deptRequester, 'other-company'),
      ).toThrow(DepartmentUnauthorizedException);
    });
  });

  // ── validateCanManage ────────────────────────────────────────────────────────

  describe('validateCanManage', () => {
    it('should allow global admin to manage any department', () => {
      expect(() =>
        service.validateCanManage(globalRequester, 'any-company'),
      ).not.toThrow();
    });

    it('should allow company admin to manage their own company departments', () => {
      expect(() =>
        service.validateCanManage(companyRequester, 'company-1'),
      ).not.toThrow();
    });

    it('should throw DepartmentUnauthorizedException for company admin in another company', () => {
      expect(() =>
        service.validateCanManage(companyRequester, 'other-company'),
      ).toThrow(DepartmentUnauthorizedException);
    });

    it('should throw DepartmentUnauthorizedException for department-level user', () => {
      expect(() =>
        service.validateCanManage(deptRequester, 'company-1'),
      ).toThrow(DepartmentUnauthorizedException);
    });
  });
});
