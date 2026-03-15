import { updateOrganizationSchema } from './updateOrganization.schema';

describe('updateOrganizationSchema', () => {
    it('should validate with empty object', () => {
        const result = updateOrganizationSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with valid name', () => {
        const result = updateOrganizationSchema.safeParse({ name: 'New Company Name' });
        expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
        const result = updateOrganizationSchema.safeParse({ name: 'A' });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateOrganizationSchema.safeParse({ name: 'Valid Name', extra: 'field' });
        expect(result.success).toBe(false);
    });
});
