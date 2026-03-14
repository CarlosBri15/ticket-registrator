import { updateDepartmentSchema } from './updateDepartment.schema';

describe('updateDepartmentSchema', () => {
    it('should validate with empty object', () => {
        const result = updateDepartmentSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with valid name', () => {
        const result = updateDepartmentSchema.safeParse({ name: 'New Department' });
        expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
        const result = updateDepartmentSchema.safeParse({ name: 'A' });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateDepartmentSchema.safeParse({ name: 'Finance', extra: 'field' });
        expect(result.success).toBe(false);
    });
});
