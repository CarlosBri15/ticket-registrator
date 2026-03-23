import { permissions } from './permissions';

describe('permissions constants', () => {
    it('should define user permissions', () => {
        expect(permissions.VIEW_USERS).toBe('view_users');
        expect(permissions.CREATE_USERS).toBe('create_users');
        expect(permissions.EDIT_USERS).toBe('edit_users');
        expect(permissions.DELETE_USERS).toBe('delete_users');
    });

    it('should define report permissions', () => {
        expect(permissions.VIEW_REPORTS).toBe('view_reports');
        expect(permissions.CREATE_REPORTS).toBe('create_reports');
        expect(permissions.EDIT_REPORTS).toBe('edit_reports');
        expect(permissions.DELETE_REPORTS).toBe('delete_reports');
        expect(permissions.SUBMIT_REPORTS).toBe('submit_reports');
        expect(permissions.APPROVE_REPORTS).toBe('approve_reports');
    });

    it('should define ticket permissions', () => {
        expect(permissions.VIEW_TICKETS).toBe('view_tickets');
        expect(permissions.CREATE_TICKETS).toBe('create_tickets');
        expect(permissions.EDIT_TICKETS).toBe('edit_tickets');
        expect(permissions.DELETE_TICKETS).toBe('delete_tickets');
        expect(permissions.APPROVE_TICKETS).toBe('approve_tickets');
    });

    it('should define role and permission management permissions', () => {
        expect(permissions.VIEW_ROLES).toBe('view_roles');
        expect(permissions.CREATE_ROLES).toBe('create_roles');
        expect(permissions.EDIT_ROLES).toBe('edit_roles');
        expect(permissions.DELETE_ROLES).toBe('delete_roles');
        expect(permissions.VIEW_PERMISSIONS).toBe('view_permissions');
        expect(permissions.MANAGE_PERMISSIONS).toBe('manage_permissions');
    });

    it('should define department permissions', () => {
        expect(permissions.VIEW_DEPARTMENTS).toBe('view_departments');
        expect(permissions.CREATE_DEPARTMENTS).toBe('create_departments');
        expect(permissions.EDIT_DEPARTMENTS).toBe('edit_departments');
        expect(permissions.DELETE_DEPARTMENTS).toBe('delete_departments');
    });

    it('should define company permissions', () => {
        expect(permissions.VIEW_COMPANY).toBe('view_company');
        expect(permissions.CREATE_COMPANY).toBe('create_company');
        expect(permissions.EDIT_COMPANY).toBe('edit_company');
        expect(permissions.DELETE_COMPANY).toBe('delete_company');
    });

    it('all permission values should be snake_case strings', () => {
        Object.values(permissions).forEach((value) => {
            expect(typeof value).toBe('string');
            expect(value).toMatch(/^[a-z_]+$/);
        });
    });

    it('all permission values should be unique', () => {
        const values = Object.values(permissions);
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });
});
