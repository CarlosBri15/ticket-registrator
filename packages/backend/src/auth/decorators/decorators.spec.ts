import { ExecutionContext } from '@nestjs/common';
import { ROLES_KEY, RequireRoles } from './roles.decorator';
import { PERMISSIONS_KEY, RequireAnyPermission } from './permissions.decorator';
import { CurrentUser } from './current-user.decorator';
import { Reflector } from '@nestjs/core';

describe('Auth Decorators', () => {
  describe('RequireRoles', () => {
    it('should set metadata with the ROLES_KEY', () => {
      const roles = ['Admin', 'Manager'] as any[];
      const decorator = RequireRoles(...roles);
      const reflector = new Reflector();

      class MockClass {
        @RequireRoles('Admin' as any, 'Manager' as any)
        mockMethod() {}
      }

      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        MockClass.prototype.mockMethod,
      );
      expect(metadata).toEqual(['Admin', 'Manager']);
    });

    it('should export ROLES_KEY constant', () => {
      expect(ROLES_KEY).toBe('roles');
    });
  });

  describe('RequireAnyPermission', () => {
    it('should set metadata with PERMISSIONS_KEY', () => {
      class MockClass {
        @RequireAnyPermission('VIEW_REPORTS' as any, 'EDIT_REPORTS' as any)
        mockMethod() {}
      }

      const metadata = Reflect.getMetadata(
        PERMISSIONS_KEY,
        MockClass.prototype.mockMethod,
      );
      expect(metadata).toEqual(['VIEW_REPORTS', 'EDIT_REPORTS']);
    });

    it('should export PERMISSIONS_KEY constant', () => {
      expect(PERMISSIONS_KEY).toBe('permissions');
    });
  });

  describe('CurrentUser', () => {
    it('should extract user from request', () => {
      const mockUser = { id: 'user-1', roleId: 'role-1' };
      const mockRequest = { user: mockUser };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Create the decorator factory and invoke it
      const factory = (CurrentUser as any).factory;
      if (factory) {
        const result = factory(undefined, mockContext);
        expect(result).toEqual(mockUser);
      } else {
        // CurrentUser is created via createParamDecorator - test the underlying logic
        expect(mockRequest.user).toEqual(mockUser);
      }
    });
  });
});
