import { PermissionsGuard } from './permissions.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { permissions } from '@ticket-registrator/shared';

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new PermissionsGuard(reflector);
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

    it('should allow access if no permissions are required (decorator not present)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        const context = mockExecutionContext();

        const result = guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user is not present but permissions are required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_ALL_REPORTS]);
        const context = mockExecutionContext(null); // No user

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow('User lacks necessary permissions');
    });

    it('should throw ForbiddenException if user has no permissions array', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_ALL_REPORTS]);
        const context = mockExecutionContext({ id: '123' }); // User without permissions array

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user does not have any of the required permissions', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            permissions.VIEW_ALL_REPORTS,
            permissions.VIEW_TEAM_REPORTS,
        ]);
        const context = mockExecutionContext({
            id: '123',
            permissions: [permissions.VIEW_OWN_REPORTS], // Has different permission
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(/Access denied/);
    });

    it('should allow access if user has exactly the required permission', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_ALL_REPORTS]);
        const context = mockExecutionContext({
            id: '123',
            permissions: [permissions.VIEW_ALL_REPORTS], // Has the permission
        });

        const result = guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should allow access if user has one of several required permissions', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            permissions.VIEW_OWN_REPORTS,
            permissions.VIEW_TEAM_REPORTS,
        ]);
        const context = mockExecutionContext({
            id: '123',
            permissions: [permissions.VIEW_TEAM_REPORTS, permissions.EDIT_OWN_USER_INFO], // Has one valid permission
        });

        const result = guard.canActivate(context);
        expect(result).toBe(true);
    });
});
