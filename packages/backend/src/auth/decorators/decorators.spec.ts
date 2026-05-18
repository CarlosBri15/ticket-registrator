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
        @RequireRoles('Admin', 'Manager')
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
    function getDecoratorFactory(decorator: (...args: any[]) => any): (data: unknown, ctx: ExecutionContext) => any {
      // createParamDecorator stores the factory under ROUTE_ARGS_METADATA keyed on
      // the target class/method. We retrieve it by applying the decorator to a
      // temporary class and reading back the stored metadata entry.
      class Target {
        method(@decorator() _user: any) {}
      }
      const metadata = Reflect.getMetadata(
        '__routeArguments__',
        Target,
        'method',
      );
      // The metadata map key format is `<type>:<index>`, value has a `factory` field.
      const entry = Object.values(metadata ?? {})[0] as any;
      return entry.factory;
    }

    it('should extract user from request', () => {
      const mockUser = {
        id: 'user-1',
        roleId: 'role-1',
        roleName: 'Employee' as any,
        roleHierarchy: 10,
        companyId: 'company-1',
        departmentIds: [],
        permissions: [],
      };
      const mockRequest = { user: mockUser };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const factory = getDecoratorFactory(CurrentUser);
      const result = factory(undefined, mockContext);

      expect(result).toEqual(mockUser);
    });

    it('should return the exact user object reference from the request', () => {
      const mockUser = {
        id: 'user-2',
        roleId: 'role-2',
        roleName: 'Admin' as any,
        roleHierarchy: 99,
        companyId: 'company-2',
        departmentIds: ['dept-1'],
        permissions: ['create_users' as any],
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as unknown as ExecutionContext;

      const factory = getDecoratorFactory(CurrentUser);
      const result = factory(undefined, mockContext);

      expect(result).toBe(mockUser);
    });
  });
});
