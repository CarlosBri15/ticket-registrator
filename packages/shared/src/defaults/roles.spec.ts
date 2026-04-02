import { Roles, AUTHORITY_LEVELS, ROLE_HIERARCHY, DEFAULT_DEPARTMENTS } from './roles';

describe('Roles constants', () => {
    it('should define all role names', () => {
        expect(Roles.EMPLOYEE).toBe('Employee');
        expect(Roles.MANAGER).toBe('Manager');
        expect(Roles.CONTROLLER).toBe('Controller');
        expect(Roles.ADMIN).toBe('Admin');
        expect(Roles.SUPERADMIN).toBe('SuperAdmin');
    });

    it('should have exactly 5 roles', () => {
        expect(Object.keys(Roles)).toHaveLength(5);
    });
});

describe('AUTHORITY_LEVELS', () => {
    it('should define correct authority thresholds', () => {
        expect(AUTHORITY_LEVELS.GLOBAL).toBe(100);
        expect(AUTHORITY_LEVELS.COMPANY).toBe(99);
        expect(AUTHORITY_LEVELS.DEPARTMENT).toBe(40);
        expect(AUTHORITY_LEVELS.SELF).toBe(0);
    });
});

describe('ROLE_HIERARCHY', () => {
    it('should map each role to a numeric hierarchy value', () => {
        expect(ROLE_HIERARCHY['Employee']).toBe(10);
        expect(ROLE_HIERARCHY['Manager']).toBe(50);
        expect(ROLE_HIERARCHY['Controller']).toBe(55);
        expect(ROLE_HIERARCHY['Admin']).toBe(99);
        expect(ROLE_HIERARCHY['SuperAdmin']).toBe(100);
    });

    it('should have hierarchy in ascending order: Employee < Manager < Controller < Admin < SuperAdmin', () => {
        expect(ROLE_HIERARCHY['Employee']).toBeLessThan(ROLE_HIERARCHY['Manager']);
        expect(ROLE_HIERARCHY['Manager']).toBeLessThan(ROLE_HIERARCHY['Controller']);
        expect(ROLE_HIERARCHY['Controller']).toBeLessThan(ROLE_HIERARCHY['Admin']);
        expect(ROLE_HIERARCHY['Admin']).toBeLessThan(ROLE_HIERARCHY['SuperAdmin']);
    });
});

describe('DEFAULT_DEPARTMENTS', () => {
    it('should contain 4 default department names', () => {
        expect(DEFAULT_DEPARTMENTS).toHaveLength(4);
    });

    it('should include expected department names', () => {
        expect(DEFAULT_DEPARTMENTS).toContain('People & Culture');
        expect(DEFAULT_DEPARTMENTS).toContain('Finance & Controlling');
        expect(DEFAULT_DEPARTMENTS).toContain('Legal & Compliance');
        expect(DEFAULT_DEPARTMENTS).toContain('Marketing & Communications');
    });
});
