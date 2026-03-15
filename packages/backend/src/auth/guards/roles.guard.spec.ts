import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@ticket-registrator/shared';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (userObj: any = null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userObj,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required (decorator not present)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = mockExecutionContext();

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not present but roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
    const context = mockExecutionContext(null); // No user

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'User lacks necessary role',
    );
  });

  it('should throw ForbiddenException if user has no role defined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
    const context = mockExecutionContext({ id: '123' }); // User without role

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user does not match required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Roles.ADMIN, Roles.SUPERADMIN]);
    const context = mockExecutionContext({
      id: '123',
      role: Roles.EMPLOYEE, // User is just an employee
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(/Access denied/);
  });

  it('should allow access if user has the exact required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
    const context = mockExecutionContext({
      id: '123',
      role: Roles.ADMIN,
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if user has one of several required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Roles.MANAGER, Roles.ADMIN]);
    const context = mockExecutionContext({
      id: '123',
      role: Roles.MANAGER,
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
