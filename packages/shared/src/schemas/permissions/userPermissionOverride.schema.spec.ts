import { userPermissionOverrideSchema } from './userPermissionOverride.schema';
import { permissions } from '../../defaults/permissions';

const validUUID = '123e4567-e89b-12d3-a456-426614174000';

describe('userPermissionOverrideSchema', () => {
    it('should validate with valid permissions', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: validUUID,
            permissions: [permissions.VIEW_REPORTS, permissions.CREATE_REPORTS],
            isActive: true,
        });
        expect(result.success).toBe(true);
    });

    it('should validate with empty permissions array', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: validUUID,
            permissions: [],
        });
        expect(result.success).toBe(true);
    });

    it('should default isActive to true', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: validUUID,
            permissions: [],
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.isActive).toBe(true);
        }
    });

    it('should validate with isActive false', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: validUUID,
            permissions: [],
            isActive: false,
        });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid userId', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: 'not-a-uuid',
            permissions: [],
        });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid permission value', () => {
        const result = userPermissionOverrideSchema.safeParse({
            userId: validUUID,
            permissions: ['invalid_permission_that_does_not_exist'],
        });
        expect(result.success).toBe(false);
    });
});
