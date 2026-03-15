import { updatePermissionSchema } from './updatePermission.schema';

describe('updatePermissionSchema', () => {
    it('should validate with empty object (all optional)', () => {
        const result = updatePermissionSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with valid name', () => {
        const result = updatePermissionSchema.safeParse({ name: 'updated_permission' });
        expect(result.success).toBe(true);
    });

    it('should validate with valid description', () => {
        const result = updatePermissionSchema.safeParse({ description: 'Updated description' });
        expect(result.success).toBe(true);
    });

    it('should fail with empty name', () => {
        const result = updatePermissionSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
    });

    it('should fail with name too long', () => {
        const result = updatePermissionSchema.safeParse({ name: 'a'.repeat(151) });
        expect(result.success).toBe(false);
    });
});
