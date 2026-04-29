import { createUserSchema } from './createUser.schema';

const validPayload = {
    name: 'John',
    surname: 'Doe',
    email: 'john@test.com',
    username: 'johndoe',
    password: 'pass123',
    confirmPassword: 'pass123',
    roleId: '123e4567-e89b-12d3-a456-426614174000',
};

describe('createUserSchema', () => {
    describe('valid data', () => {
        it('should accept a valid payload', () => {
            expect(createUserSchema.safeParse(validPayload).success).toBe(true);
        });

        it('should accept optional departmentIds', () => {
            const data = {
                ...validPayload,
                departmentIds: [
                    '123e4567-e89b-12d3-a456-426614174001',
                    '123e4567-e89b-12d3-a456-426614174002',
                ],
            };
            expect(createUserSchema.safeParse(data).success).toBe(true);
        });

        it('should accept payload without departmentIds', () => {
            const { ...data } = validPayload;
            expect(createUserSchema.safeParse(data).success).toBe(true);
        });
    });

    describe('name validation', () => {
        it('should reject name shorter than 2 characters', () => {
            const result = createUserSchema.safeParse({ ...validPayload, name: 'J' });
            expect(result.success).toBe(false);
        });

        it('should reject name longer than 255 characters', () => {
            const result = createUserSchema.safeParse({ ...validPayload, name: 'J'.repeat(256) });
            expect(result.success).toBe(false);
        });
    });

    describe('email validation', () => {
        it('should reject invalid email', () => {
            const result = createUserSchema.safeParse({ ...validPayload, email: 'not-an-email' });
            expect(result.success).toBe(false);
        });
    });

    describe('username validation', () => {
        it('should reject username shorter than 3 characters', () => {
            const result = createUserSchema.safeParse({ ...validPayload, username: 'ab' });
            expect(result.success).toBe(false);
        });
    });

    describe('password validation', () => {
        it('should reject password shorter than 6 characters', () => {
            const result = createUserSchema.safeParse({ ...validPayload, password: '12345', confirmPassword: '12345' });
            expect(result.success).toBe(false);
        });
    });

    describe('password confirmation', () => {
        it('should reject when passwords do not match', () => {
            const result = createUserSchema.safeParse({
                ...validPayload,
                password: 'pass123',
                confirmPassword: 'different',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const confirmError = result.error.issues.find(e => e.path.includes('confirmPassword'));
                expect(confirmError?.message).toBe('Passwords do not match');
            }
        });
    });

    describe('roleId validation', () => {
        it('should reject non-UUID roleId', () => {
            const result = createUserSchema.safeParse({ ...validPayload, roleId: 'not-a-uuid' });
            expect(result.success).toBe(false);
        });
    });

    describe('departmentIds validation', () => {
        it('should reject non-UUID departmentIds', () => {
            const result = createUserSchema.safeParse({
                ...validPayload,
                departmentIds: ['not-a-uuid'],
            });
            expect(result.success).toBe(false);
        });
    });
});
