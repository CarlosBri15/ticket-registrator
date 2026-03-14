import { onboardOrganizationSchema } from './onboardOrganization.schema';

const validData = {
    company: { name: 'Acme Corp' },
    admins: [{ name: 'John', surname: 'Doe', email: 'john@acme.com' }],
};

describe('onboardOrganizationSchema', () => {
    it('should validate correct data', () => {
        const result = onboardOrganizationSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate with multiple admins', () => {
        const result = onboardOrganizationSchema.safeParse({
            ...validData,
            admins: [
                { name: 'John', surname: 'Doe', email: 'john@acme.com' },
                { name: 'Jane', surname: 'Smith', email: 'jane@acme.com' },
            ],
        });
        expect(result.success).toBe(true);
    });

    it('should fail with short company name', () => {
        const result = onboardOrganizationSchema.safeParse({ ...validData, company: { name: 'A' } });
        expect(result.success).toBe(false);
    });

    it('should fail with empty admins array', () => {
        const result = onboardOrganizationSchema.safeParse({ ...validData, admins: [] });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid admin email', () => {
        const result = onboardOrganizationSchema.safeParse({
            ...validData,
            admins: [{ name: 'John', surname: 'Doe', email: 'not-an-email' }],
        });
        expect(result.success).toBe(false);
    });

    it('should fail with short admin name', () => {
        const result = onboardOrganizationSchema.safeParse({
            ...validData,
            admins: [{ name: 'J', surname: 'Doe', email: 'john@acme.com' }],
        });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = onboardOrganizationSchema.safeParse({ ...validData, extra: 'field' });
        expect(result.success).toBe(false);
    });

    it('should fail with extra admin fields (strict admin schema)', () => {
        const result = onboardOrganizationSchema.safeParse({
            ...validData,
            admins: [{ name: 'John', surname: 'Doe', email: 'john@acme.com', extra: 'field' }],
        });
        expect(result.success).toBe(false);
    });
});
