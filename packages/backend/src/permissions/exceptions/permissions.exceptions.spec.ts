import {
  PermissionNotFoundException,
  PermissionConflictException,
  PermissionAssignmentException,
  PermissionUnauthorizedException,
} from './permissions.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Permissions Exceptions', () => {
  describe('PermissionNotFoundException', () => {
    it('should include identifier in message', () => {
      const ex = new PermissionNotFoundException('perm-1');
      expect(ex.message).toContain('perm-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PermissionConflictException', () => {
    it('should use provided message', () => {
      const ex = new PermissionConflictException('Conflict occurred');
      expect(ex.message).toBe('Conflict occurred');
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('PermissionAssignmentException', () => {
    it('should use provided message', () => {
      const ex = new PermissionAssignmentException('Assignment error');
      expect(ex.message).toBe('Assignment error');
      expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PermissionUnauthorizedException', () => {
    it('should use default message', () => {
      const ex = new PermissionUnauthorizedException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new PermissionUnauthorizedException('Custom unauthorized');
      expect(ex.message).toBe('Custom unauthorized');
    });
  });
});
