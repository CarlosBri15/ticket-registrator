import { updateTicketFieldsSchema, updateTicketStatusSchema, updateTicketLlmSchema } from './updateTicket.schema';
import { TicketStatus } from '../../statuses/ticket-status';

describe('updateTicketFieldsSchema', () => {
    it('should validate with empty object', () => {
        const result = updateTicketFieldsSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
        const result = updateTicketFieldsSchema.safeParse({
            payment_type: 'cash',
            amount: 100,
            currency: 'EUR',
        });
        expect(result.success).toBe(true);
    });

    it('should validate with valid items', () => {
        const result = updateTicketFieldsSchema.safeParse({
            items: [{ name: 'Coffee', amount: 2.5, currency: 'EUR' }],
        });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid item in items array', () => {
        const result = updateTicketFieldsSchema.safeParse({
            items: [{ name: '', amount: 2.5, currency: 'EUR' }],
        });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateTicketFieldsSchema.safeParse({ unknownField: 'value' });
        expect(result.success).toBe(false);
    });

    it('should validate with valid date', () => {
        const result = updateTicketFieldsSchema.safeParse({ date: '2024-03-01' });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid date', () => {
        const result = updateTicketFieldsSchema.safeParse({ date: 'not-a-date' });
        expect(result.success).toBe(false);
    });
});

describe('updateTicketStatusSchema', () => {
    it('should validate PENDING status', () => {
        const result = updateTicketStatusSchema.safeParse({ status: TicketStatus.PENDING, approved_amount: 0 });
        expect(result.success).toBe(true);
    });

    it('should validate APPROVED status', () => {
        const result = updateTicketStatusSchema.safeParse({ status: TicketStatus.APPROVED, approved_amount: 50 });
        expect(result.success).toBe(true);
    });

    it('should validate REJECTED status', () => {
        const result = updateTicketStatusSchema.safeParse({ status: TicketStatus.REJECTED, approved_amount: 0 });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid status', () => {
        const result = updateTicketStatusSchema.safeParse({ status: 'Invalid', approved_amount: 0 });
        expect(result.success).toBe(false);
    });

    it('should fail without approved_amount', () => {
        const result = updateTicketStatusSchema.safeParse({ status: TicketStatus.APPROVED });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateTicketStatusSchema.safeParse({ status: TicketStatus.APPROVED, approved_amount: 10, extra: 'field' });
        expect(result.success).toBe(false);
    });
});

describe('updateTicketLlmSchema', () => {
    it('should validate with all optional fields empty', () => {
        const result = updateTicketLlmSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with all LLM fields', () => {
        const result = updateTicketLlmSchema.safeParse({
            llm_appproved_percentage: 80,
            llm_recomendation: 'Approved within policy',
            llm_suggested_amount: 45.0,
            llm_suggested_currency: 'EUR',
        });
        expect(result.success).toBe(true);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateTicketLlmSchema.safeParse({ unknownField: 'value' });
        expect(result.success).toBe(false);
    });
});
