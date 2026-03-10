import { PermissionsGuard } from './permissions.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { permissions } from '@ticket-registrator/shared';

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;
    let rolesService: any;

    beforeEach(() => {
        reflector = new Reflector();
        rolesService = {
            getPermissionsForRoles: jest.fn(),
        };
        guard = new PermissionsGuard(reflector, rolesService);
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

    it('should throw ForbiddenException if user is not present but permissions are required', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_REPORTS]);
        const context = mockExecutionContext(null); // No user

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        await expect(guard.canActivate(context)).rejects.toThrow('User lacks necessary role information');
    });

    it('should throw ForbiddenException if user has no roles array', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_REPORTS]);
        const context = mockExecutionContext({ id: '123' }); // User without roles array

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user does not have any of the required permissions', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            permissions.VIEW_REPORTS,
            permissions.MANAGE_PERMISSIONS,
        ]);
        rolesService.getPermissionsForRoles.mockResolvedValue([permissions.VIEW_USERS]);
        const context = mockExecutionContext({
            id: '123',
            roles: ['some-role'],
            companyId: 'comp-1',
        });

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        await expect(guard.canActivate(context)).rejects.toThrow(/Access denied/);
    });

    it('should allow access if user has exactly the required permission', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([permissions.VIEW_REPORTS]);
        rolesService.getPermissionsForRoles.mockResolvedValue([permissions.VIEW_REPORTS]);
        const context = mockExecutionContext({
            id: '123',
            roles: ['some-role'],
            companyId: 'comp-1',
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should allow access if user has one of several required permissions', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            permissions.VIEW_REPORTS,
            permissions.CREATE_USERS,
        ]);
        rolesService.getPermissionsForRoles.mockResolvedValue([permissions.CREATE_USERS, permissions.VIEW_USERS]);
        const context = mockExecutionContext({
            id: '123',
            roles: ['some-role'],
            companyId: 'comp-1',
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
