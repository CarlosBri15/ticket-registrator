import { registerDepartmentSchema } from './createDepartment.schema';

describe('registerDepartmentSchema', () => {
    it('should validate with valid name', () => {
        const result = registerDepartmentSchema.safeParse({ name: 'Finance' });
        expect(result.success).toBe(true);
    });

    it('should fail without name', () => {
        const result = registerDepartmentSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = registerDepartmentSchema.safeParse({ name: 'Finance', extra: 'field' });
        expect(result.success).toBe(false);
    });

    it('should accept empty string name', () => {
        const result = registerDepartmentSchema.safeParse({ name: '' });
        expect(result.success).toBe(true);
    });
});
