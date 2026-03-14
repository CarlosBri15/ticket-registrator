import { assignPermissionSchema } from './assignPermission.schema';

const validUUID = '123e4567-e89b-12d3-a456-426614174000';
const anotherUUID = '123e4567-e89b-12d3-a456-426614174001';

describe('assignPermissionSchema', () => {
    it('should validate with valid UUIDs', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: validUUID,
            permissionId: anotherUUID,
        });
        expect(result.success).toBe(true);
    });

    it('should validate with null companyId', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: validUUID,
            permissionId: anotherUUID,
            companyId: null,
        });
        expect(result.success).toBe(true);
    });

    it('should validate with valid companyId', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: validUUID,
            permissionId: anotherUUID,
            companyId: '123e4567-e89b-12d3-a456-426614174002',
        });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid roleId', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: 'not-a-uuid',
            permissionId: anotherUUID,
        });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid permissionId', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: validUUID,
            permissionId: 'not-a-uuid',
        });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid companyId (not UUID)', () => {
        const result = assignPermissionSchema.safeParse({
            roleId: validUUID,
            permissionId: anotherUUID,
            companyId: 'not-a-uuid',
        });
        expect(result.success).toBe(false);
    });
});
