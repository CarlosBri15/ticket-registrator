import { createRoleSchema } from './createRole.schema';

describe('createRoleSchema', () => {
    it('should validate correct data', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 3 });
        expect(result.success).toBe(true);
    });

    it('should validate with optional description', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 3, description: 'Can audit expenses' });
        expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
        const result = createRoleSchema.safeParse({ name: 'A', hierarchy: 1 });
        expect(result.success).toBe(false);
    });

    it('should fail with hierarchy below 1', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 0 });
        expect(result.success).toBe(false);
    });

    it('should fail with hierarchy above 99', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 100 });
        expect(result.success).toBe(false);
    });

    it('should fail with non-integer hierarchy', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 1.5 });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = createRoleSchema.safeParse({ name: 'Auditor', hierarchy: 2, extra: 'field' });
        expect(result.success).toBe(false);
    });

    it('should accept boundary hierarchy values (1 and 99)', () => {
        expect(createRoleSchema.safeParse({ name: 'Role1', hierarchy: 1 }).success).toBe(true);
        expect(createRoleSchema.safeParse({ name: 'Role99', hierarchy: 99 }).success).toBe(true);
    });
});
