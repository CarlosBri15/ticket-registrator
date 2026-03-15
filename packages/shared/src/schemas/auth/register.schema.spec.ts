import { registerSchema } from './register.schema';

const validData = {
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'password1234',
    confirmPassword: 'password1234',
    roleId: '123e4567-e89b-12d3-a456-426614174000',
    departmentIds: ['123e4567-e89b-12d3-a456-426614174001'],
};

describe('registerSchema', () => {
    it('should validate correct data', () => {
        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
        const result = registerSchema.safeParse({ ...validData, name: 'J' });
        expect(result.success).toBe(false);
    });

    it('should fail with short surname', () => {
        const result = registerSchema.safeParse({ ...validData, surname: 'D' });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid email', () => {
        const result = registerSchema.safeParse({ ...validData, email: 'not-an-email' });
        expect(result.success).toBe(false);
    });

    it('should fail with short password', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'short', confirmPassword: 'short' });
        expect(result.success).toBe(false);
    });

    it('should fail when passwords do not match', () => {
        const result = registerSchema.safeParse({ ...validData, confirmPassword: 'differentpassword' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const confirmError = result.error.errors.find(e => e.path.includes('confirmPassword'));
            expect(confirmError?.message).toBe('Passwords do not match');
        }
    });

    it('should fail with invalid roleId (not UUID)', () => {
        const result = registerSchema.safeParse({ ...validData, roleId: 'not-a-uuid' });
        expect(result.success).toBe(false);
    });

    it('should fail with empty departmentIds', () => {
        const result = registerSchema.safeParse({ ...validData, departmentIds: [] });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid departmentId (not UUID)', () => {
        const result = registerSchema.safeParse({ ...validData, departmentIds: ['not-a-uuid'] });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = registerSchema.safeParse({ ...validData, extraField: 'value' });
        expect(result.success).toBe(false);
    });
});
