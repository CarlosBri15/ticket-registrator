import { createReportSchema } from './createReport.schema';

describe('CreateReport Schema', () => {
    it('should validate a correct report', () => {
        const validReport = {
            name: 'Business Trip',
            start_date: '2024-03-01',
            end_date: '2024-03-05',
            currency: 'EUR',
            type: 'travel'
        };
        const result = createReportSchema.safeParse(validReport);
        expect(result.success).toBe(true);
    });

    it('should fail if name is missing', () => {
        const invalidReport = {
            start_date: '2024-03-01',
            end_date: '2024-03-05',
            currency: 'EUR'
        };
        const result = createReportSchema.safeParse(invalidReport);
        expect(result.success).toBe(false);
    });

    it('should fail if dates are invalid', () => {
        const invalidReport = {
            name: 'Report',
            start_date: 'not-a-date',
            end_date: '2024-03-05',
            currency: 'EUR'
        };
        const result = createReportSchema.safeParse(invalidReport);
        expect(result.success).toBe(false);
    });
});
