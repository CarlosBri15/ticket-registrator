import { createTicketSchema } from './createTicket.schema';

describe('createTicketSchema', () => {
    it('should validate with all optional fields empty', () => {
        const result = createTicketSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with all fields provided', () => {
        const result = createTicketSchema.safeParse({
            date: '2024-03-01',
            location_name: 'Restaurant',
            location_address: '123 Main St',
            amount: 45.50,
            currency: 'EUR',
            converted_amount: 49.0,
            converted_currency: 'USD',
            cgs_bucket_link_justification: 'Business lunch',
            last_four_digits: '1234',
        });
        expect(result.success).toBe(true);
    });

    it('should validate with items array', () => {
        const result = createTicketSchema.safeParse({
            items: [{ name: 'Coffee', amount: 3.5, currency: 'EUR' }],
        });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid item in items array', () => {
        const result = createTicketSchema.safeParse({
            items: [{ name: '', amount: 3.5, currency: 'EUR' }],
        });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid date', () => {
        const result = createTicketSchema.safeParse({ date: 'not-a-date' });
        expect(result.success).toBe(false);
    });

    it('should validate with empty items array', () => {
        const result = createTicketSchema.safeParse({ items: [] });
        expect(result.success).toBe(true);
    });
});
