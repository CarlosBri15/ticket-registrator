import { createItemSchema } from './createItem.schema';

describe('createItemSchema', () => {
    it('should validate correct item data', () => {
        const result = createItemSchema.safeParse({
            name: 'Lunch',
            amount: 25.50,
            currency: 'EUR',
        });
        expect(result.success).toBe(true);
    });

    it('should fail with empty name', () => {
        const result = createItemSchema.safeParse({ name: '', amount: 10, currency: 'EUR' });
        expect(result.success).toBe(false);
    });

    it('should fail with missing name', () => {
        const result = createItemSchema.safeParse({ amount: 10, currency: 'EUR' });
        expect(result.success).toBe(false);
    });

    it('should fail with missing amount', () => {
        const result = createItemSchema.safeParse({ name: 'Lunch', currency: 'EUR' });
        expect(result.success).toBe(false);
    });

    it('should fail with empty currency', () => {
        const result = createItemSchema.safeParse({ name: 'Lunch', amount: 10, currency: '' });
        expect(result.success).toBe(false);
    });

    it('should fail with missing currency', () => {
        const result = createItemSchema.safeParse({ name: 'Lunch', amount: 10 });
        expect(result.success).toBe(false);
    });

    it('should accept negative amounts', () => {
        const result = createItemSchema.safeParse({ name: 'Refund', amount: -5, currency: 'USD' });
        expect(result.success).toBe(true);
    });

    it('should accept zero amount', () => {
        const result = createItemSchema.safeParse({ name: 'Free item', amount: 0, currency: 'EUR' });
        expect(result.success).toBe(true);
    });
});
