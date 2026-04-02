import { createPermissionSchema } from './createPermission.schema';

describe('createPermissionSchema', () => {
    it('should validate with valid name', () => {
        const result = createPermissionSchema.safeParse({ name: 'view_reports' });
        expect(result.success).toBe(true);
    });

    it('should validate with name and description', () => {
        const result = createPermissionSchema.safeParse({ name: 'view_reports', description: 'Can view all reports' });
        expect(result.success).toBe(true);
    });

    it('should fail with empty name', () => {
        const result = createPermissionSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
    });

    it('should fail with name too long (>150 chars)', () => {
        const result = createPermissionSchema.safeParse({ name: 'a'.repeat(151) });
        expect(result.success).toBe(false);
    });

    it('should fail with description too long (>255 chars)', () => {
        const result = createPermissionSchema.safeParse({ name: 'valid', description: 'a'.repeat(256) });
        expect(result.success).toBe(false);
    });

    it('should accept description at 255 chars', () => {
        const result = createPermissionSchema.safeParse({ name: 'valid', description: 'a'.repeat(255) });
        expect(result.success).toBe(true);
    });
});
