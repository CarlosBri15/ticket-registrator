import { Test, TestingModule } from '@nestjs/testing';
import { UsersAuthorizationService } from './users-authorization.service';
import { AUTHORITY_LEVELS, permissions } from '@ticket-registrator/shared';

describe('UsersAuthorizationService', () => {
  let service: UsersAuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersAuthorizationService],
    }).compile();

    service = module.get<UsersAuthorizationService>(UsersAuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCanCreateAdmin', () => {
    it('should return true if permission exists', () => {
      expect(service.validateCanCreateAdmin([permissions.CREATE_ADMINS])).toBe(true);
    });

    it('should return false if permission does not exist', () => {
      expect(service.validateCanCreateAdmin([])).toBe(false);
    });
  });

  describe('validateHierarchyAssignment', () => {
    it('should return true if requester hierarchy is higher', () => {
      expect(service.validateHierarchyAssignment(10, 5)).toBe(true);
    });

    it('should return false if requester hierarchy is equal or lower', () => {
      expect(service.validateHierarchyAssignment(5, 5)).toBe(false);
      expect(service.validateHierarchyAssignment(5, 10)).toBe(false);
    });
  });

  describe('validateDepartmentAssignment', () => {
    it('should return true if requester is high hierarchy', () => {
      expect(service.validateDepartmentAssignment(AUTHORITY_LEVELS.COMPANY, [], ['dept-1'])).toBe(true);
    });

    it('should return true if manager assign their own departments', () => {
      expect(service.validateDepartmentAssignment(AUTHORITY_LEVELS.DEPARTMENT, ['dept-1'], ['dept-1'])).toBe(true);
    });

    it('should return false if manager assign departments they dont belong to', () => {
      expect(service.validateDepartmentAssignment(AUTHORITY_LEVELS.DEPARTMENT, ['dept-1'], ['dept-1', 'dept-2'])).toBe(false);
    });
  });

  describe('validateCanUpdateUser', () => {
    const requester = {
      id: 'req-1',
      roleHierarchy: AUTHORITY_LEVELS.COMPANY,
      companyId: 'company-1',
      permissions: [permissions.EDIT_USERS],
    };

    it('should return true for self update if has permission', () => {
      expect(service.validateCanUpdateUser(requester, { id: 'req-1' } as any)).toBe(true);
    });

    it('should return false for self update without permission', () => {
      expect(service.validateCanUpdateUser({ ...requester, permissions: [] }, { id: 'req-1' } as any)).toBe(false);
    });

    it('should return false if requester hierarchy < DEPARTMENT', () => {
      expect(service.validateCanUpdateUser({ ...requester, roleHierarchy: 1, id: 'req-2' }, { id: 'req-1' } as any)).toBe(false);
    });

    it('should return false if outside company and not global', () => {
      expect(service.validateCanUpdateUser({ ...requester, id: 'req-2' }, { id: 'target-1', companyId: 'company-2' } as any)).toBe(false);
    });

    it('should return true if global requester updating different company', () => {
      expect(service.validateCanUpdateUser({ ...requester, roleHierarchy: AUTHORITY_LEVELS.GLOBAL, id: 'req-2' }, { id: 'target-1', companyId: 'company-2' } as any)).toBe(true);
    });

    it('should return false if target hierarchy >= requester hierarchy (at company level)', () => {
      const targetUser = { id: 'target-1', companyId: 'company-1', role: { hierarchy: AUTHORITY_LEVELS.COMPANY } };
      expect(service.validateCanUpdateUser({ ...requester, id: 'req-2' }, targetUser as any)).toBe(false);
    });

    it('should return true if target hierarchy < requester hierarchy', () => {
      const targetUser = { id: 'target-1', companyId: 'company-1', role: { hierarchy: 1 } };
      expect(service.validateCanUpdateUser({ ...requester, id: 'req-2' }, targetUser as any)).toBe(true);
    });
     
    it('should handle target user with no role hierarchy yet (defaults to 0)', () => {
        const targetUser = { id: 'target-1', companyId: 'company-1', role: null };
        expect(service.validateCanUpdateUser({ ...requester, id: 'req-2' }, targetUser as any)).toBe(true);
    });
  });

  describe('validateCanDeleteUser', () => {
    it('should return true if hierarchy is higher', () => {
      expect(service.validateCanDeleteUser(10, 5)).toBe(true);
    });

    it('should return false if hierarchy is equal or lower', () => {
      expect(service.validateCanDeleteUser(5, 5)).toBe(false);
      expect(service.validateCanDeleteUser(5, 10)).toBe(false);
    });
  });
});
