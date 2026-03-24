import { updateCategorySchema } from './updateCategory.schema';

describe('updateCategorySchema', () => {
    it('should validate partial data', () => {
        expect(updateCategorySchema.safeParse({ name: 'New Name' }).success).toBe(true);
        expect(updateCategorySchema.safeParse({ description: 'New Desc' }).success).toBe(true);
    });

    it('should still enforce 10-word limit on description if provided', () => {
        const invalidData = {
            description: 'one two three four five six seven eight nine ten eleven',
        };
        const result = updateCategorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
