import { updateUserSchema } from './updateUser.schema';

describe('updateUserSchema', () => {
    it('should validate with all optional fields empty', () => {
        const result = updateUserSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with valid name update', () => {
        const result = updateUserSchema.safeParse({ name: 'NewName' });
        expect(result.success).toBe(true);
    });

    it('should validate with valid email', () => {
        const result = updateUserSchema.safeParse({ email: 'new@example.com' });
        expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
        const result = updateUserSchema.safeParse({ name: 'A' });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid email', () => {
        const result = updateUserSchema.safeParse({ email: 'not-an-email' });
        expect(result.success).toBe(false);
    });

    it('should fail with short password', () => {
        const result = updateUserSchema.safeParse({ password: 'short', confirmPassword: 'short' });
        expect(result.success).toBe(false);
    });

    it('should fail when passwords do not match', () => {
        const result = updateUserSchema.safeParse({ password: 'validpassword1', confirmPassword: 'differentpassword' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const confirmError = result.error.errors.find(e => e.path.includes('confirmPassword'));
            expect(confirmError?.message).toBe('Passwords do not match');
        }
    });

    it('should pass when passwords match', () => {
        const result = updateUserSchema.safeParse({ password: 'validpassword1', confirmPassword: 'validpassword1' });
        expect(result.success).toBe(true);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateUserSchema.safeParse({ unknownField: 'value' });
        expect(result.success).toBe(false);
    });

    it('should validate valid departmentIds', () => {
        const result = updateUserSchema.safeParse({
            departmentIds: ['123e4567-e89b-12d3-a456-426614174000'],
        });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid departmentId', () => {
        const result = updateUserSchema.safeParse({ departmentIds: ['not-a-uuid'] });
        expect(result.success).toBe(false);
    });
});
