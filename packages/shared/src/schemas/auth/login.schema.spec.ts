import { loginSchema } from './login.schema';

describe('loginSchema', () => {
    it('should validate a correct login', () => {
        const result = loginSchema.safeParse({ email: 'test@test.com', password: 'password123' });
        expect(result.success).toBe(true);
    });

    it('should fail with empty email', () => {
        const result = loginSchema.safeParse({ email: '', password: 'password123' });
        expect(result.success).toBe(false);
    });

    it('should fail with short password (less than 6 chars)', () => {
        const result = loginSchema.safeParse({ email: 'test@test.com', password: '123' });
        expect(result.success).toBe(false);
    });

    it('should fail with missing fields', () => {
        const result = loginSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('should fail with missing password', () => {
        const result = loginSchema.safeParse({ email: 'test@test.com' });
        expect(result.success).toBe(false);
    });

    it('should fail with missing email', () => {
        const result = loginSchema.safeParse({ password: 'password123' });
        expect(result.success).toBe(false);
    });

    it('should accept exactly 6 character password', () => {
        const result = loginSchema.safeParse({ email: 'test@test.com', password: '123456' });
        expect(result.success).toBe(true);
    });
});
