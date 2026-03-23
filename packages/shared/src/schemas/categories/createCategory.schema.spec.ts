import { createCategorySchema } from './createCategory.schema';

describe('createCategorySchema', () => {
    it('should validate a valid category', () => {
        const validData = {
            name: 'Office Supplies',
            description: 'Paper and pens',
            organizationId: '123e4567-e89b-12d3-a456-426614174000',
        };
        expect(createCategorySchema.safeParse(validData).success).toBe(true);
    });

    it('should validate without organizationId', () => {
        const validData = {
            name: 'Office Supplies',
            description: 'Paper and pens',
        };
        expect(createCategorySchema.safeParse(validData).success).toBe(true);
    });

    it('should fail if name is empty', () => {
        const invalidData = {
            name: '',
            description: 'Description',
        };
        const result = createCategorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail if description is more than 10 words', () => {
        const invalidData = {
            name: 'Name',
            description: 'one two three four five six seven eight nine ten eleven',
        };
        const result = createCategorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Description must be at most 10 words');
        }
    });

    it('should fail if organizationId is not a UUID', () => {
        const invalidData = {
            name: 'Name',
            description: 'Desc',
            organizationId: 'not-a-uuid',
        };
        const result = createCategorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
