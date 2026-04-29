import { Roles, AUTHORITY_LEVELS, ROLE_NAME_TO_HIERARCHY } from './roles';
import { permissions } from './permissions';
import { ROLE_DEFAULT_PERMISSIONS } from './role-default-permissions';

describe('Shared Package - Identity & Access', () => {
    describe('Roles', () => {
        it('should have correct hierarchy values', () => {
            expect(ROLE_NAME_TO_HIERARCHY[Roles.SUPERADMIN]).toBe(100);
            expect(ROLE_NAME_TO_HIERARCHY[Roles.EMPLOYEE]).toBe(0);
            expect(ROLE_NAME_TO_HIERARCHY[Roles.SUPERADMIN]).toBeGreaterThan(ROLE_NAME_TO_HIERARCHY[Roles.ADMIN]);
        });

        it('should have correct authority levels', () => {
            expect(AUTHORITY_LEVELS.GLOBAL).toBe(100);
            expect(AUTHORITY_LEVELS.SELF).toBe(0);
        });
    });

    describe('Permissions', () => {
        it('should have all expected permission keys', () => {
            expect(permissions.VIEW_REPORTS).toBe('view_reports');
            expect(permissions.MANAGE_PERMISSIONS).toBe('manage_permissions');
        });
    });

    describe('Role Default Permissions', () => {
        it('should assign all permissions to SuperAdmin', () => {
            const allPermsCount = Object.keys(permissions).length;
            expect(ROLE_DEFAULT_PERMISSIONS[Roles.SUPERADMIN].length).toBe(allPermsCount);
        });

        it('should restrict Employee permissions', () => {
            const employeePerms = ROLE_DEFAULT_PERMISSIONS[Roles.EMPLOYEE];
            expect(employeePerms).toContain(permissions.CREATE_REPORTS);
            expect(employeePerms).not.toContain(permissions.APPROVE_REPORTS);
        });

        it('should allow Controllers to approve', () => {
            const controllerPerms = ROLE_DEFAULT_PERMISSIONS[Roles.CONTROLLER];
            expect(controllerPerms).toContain(permissions.APPROVE_REPORTS);
            expect(controllerPerms).toContain(permissions.APPROVE_TICKETS);
        });
    });
});
