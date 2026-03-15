import {
  RoleNotFoundException,
  RoleConflictException,
  RoleUnauthorizedException,
  RoleSystemModificationException,
} from './roles.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Roles Exceptions', () => {
  describe('RoleNotFoundException', () => {
    it('should include identifier in message', () => {
      const ex = new RoleNotFoundException('role-1');
      expect(ex.message).toContain('role-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('RoleConflictException', () => {
    it('should use provided message', () => {
      const ex = new RoleConflictException('Role conflict occurred');
      expect(ex.message).toBe('Role conflict occurred');
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('RoleUnauthorizedException', () => {
    it('should use default message', () => {
      const ex = new RoleUnauthorizedException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new RoleUnauthorizedException('Custom role unauthorized');
      expect(ex.message).toBe('Custom role unauthorized');
    });
  });

  describe('RoleSystemModificationException', () => {
    it('should use default message', () => {
      const ex = new RoleSystemModificationException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new RoleSystemModificationException(
        'System role cannot be changed',
      );
      expect(ex.message).toBe('System role cannot be changed');
    });
  });
});
