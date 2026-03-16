import { ROLE_DEFAULT_PERMISSIONS } from './role-default-permissions';
import { permissions } from './permissions';

describe('ROLE_DEFAULT_PERMISSIONS', () => {
    it('should define permissions for all 5 roles', () => {
        expect(ROLE_DEFAULT_PERMISSIONS).toHaveProperty('Employee');
        expect(ROLE_DEFAULT_PERMISSIONS).toHaveProperty('Manager');
        expect(ROLE_DEFAULT_PERMISSIONS).toHaveProperty('Controller');
        expect(ROLE_DEFAULT_PERMISSIONS).toHaveProperty('Admin');
        expect(ROLE_DEFAULT_PERMISSIONS).toHaveProperty('SuperAdmin');
    });

    describe('Employee', () => {
        it('should have view and manage own reports', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).toContain(permissions.VIEW_REPORTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).toContain(permissions.CREATE_REPORTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).toContain(permissions.SUBMIT_REPORTS);
        });

        it('should NOT have approve permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).not.toContain(permissions.APPROVE_REPORTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).not.toContain(permissions.APPROVE_TICKETS);
        });

        it('should NOT have role management permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).not.toContain(permissions.CREATE_ROLES);
            expect(ROLE_DEFAULT_PERMISSIONS['Employee']).not.toContain(permissions.VIEW_ROLES);
        });
    });

    describe('Manager', () => {
        it('should have all Employee permissions plus more', () => {
            const employeePerms = ROLE_DEFAULT_PERMISSIONS['Employee'];
            employeePerms.forEach((perm) => {
                expect(ROLE_DEFAULT_PERMISSIONS['Manager']).toContain(perm);
            });
        });

        it('should have department view permission', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Manager']).toContain(permissions.VIEW_DEPARTMENTS);
        });

        it('should NOT have approve permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Manager']).not.toContain(permissions.APPROVE_REPORTS);
        });
    });

    describe('Controller', () => {
        it('should have approve permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Controller']).toContain(permissions.APPROVE_REPORTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Controller']).toContain(permissions.APPROVE_TICKETS);
            expect(ROLE_DEFAULT_PERMISSIONS['Controller']).toContain(permissions.APPROVE_ITEMS);
        });

        it('should NOT have role management permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Controller']).not.toContain(permissions.CREATE_ROLES);
        });
    });

    describe('Admin', () => {
        it('should have role and permission management', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.VIEW_ROLES);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.CREATE_ROLES);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.DELETE_ROLES);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.VIEW_PERMISSIONS);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.CREATE_PERMISSIONS);
        });

        it('should have department management', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.CREATE_DEPARTMENTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.DELETE_DEPARTMENTS);
        });

        it('should have approve permissions', () => {
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.APPROVE_REPORTS);
            expect(ROLE_DEFAULT_PERMISSIONS['Admin']).toContain(permissions.APPROVE_TICKETS);
        });
    });

    describe('SuperAdmin', () => {
        it('should have ALL permissions', () => {
            const allPerms = Object.values(permissions);
            allPerms.forEach((perm) => {
                expect(ROLE_DEFAULT_PERMISSIONS['SuperAdmin']).toContain(perm);
            });
        });
    });
});
