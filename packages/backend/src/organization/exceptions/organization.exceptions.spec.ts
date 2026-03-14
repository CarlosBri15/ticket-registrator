import {
  OrganizationNotFoundException,
  OrganizationConflictException,
  OrganizationAlreadyDeletedException,
  OrganizationUnauthorizedException,
} from './organization.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Organization Exceptions', () => {
  describe('OrganizationNotFoundException', () => {
    it('should include id in message when provided', () => {
      const ex = new OrganizationNotFoundException('org-1');
      expect(ex.message).toContain('org-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use generic message when id not provided', () => {
      const ex = new OrganizationNotFoundException();
      expect(ex.message).toBe('Organization not found');
    });
  });

  describe('OrganizationConflictException', () => {
    it('should use provided message', () => {
      const ex = new OrganizationConflictException('Org conflict');
      expect(ex.message).toBe('Org conflict');
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('OrganizationAlreadyDeletedException', () => {
    it('should use default message', () => {
      const ex = new OrganizationAlreadyDeletedException();
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('OrganizationUnauthorizedException', () => {
    it('should use default message', () => {
      const ex = new OrganizationUnauthorizedException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new OrganizationUnauthorizedException('Custom unauthorized');
      expect(ex.message).toBe('Custom unauthorized');
    });
  });
});
