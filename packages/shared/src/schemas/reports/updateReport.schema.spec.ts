import { updateReportFieldsSchema, updateReportStatusSchema } from './updateReport.schema';
import { ReportStatus } from '../../statuses/report-status';

describe('updateReportFieldsSchema', () => {
    it('should validate with empty object', () => {
        const result = updateReportFieldsSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate with valid name', () => {
        const result = updateReportFieldsSchema.safeParse({ name: 'Updated Report' });
        expect(result.success).toBe(true);
    });

    it('should validate with valid dates', () => {
        const result = updateReportFieldsSchema.safeParse({
            start_date: '2024-01-01',
            end_date: '2024-01-15',
        });
        expect(result.success).toBe(true);
    });

    it('should fail with empty name', () => {
        const result = updateReportFieldsSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
    });

    it('should fail with invalid date', () => {
        const result = updateReportFieldsSchema.safeParse({ start_date: 'not-a-date' });
        expect(result.success).toBe(false);
    });

    it('should fail with extra fields (strict)', () => {
        const result = updateReportFieldsSchema.safeParse({ name: 'Report', unknown: 'field' });
        expect(result.success).toBe(false);
    });

    it('should validate with isVisible boolean', () => {
        const result = updateReportFieldsSchema.safeParse({ isVisible: false });
        expect(result.success).toBe(true);
    });
});

describe('updateReportStatusSchema', () => {
    it('should validate APPROVED status', () => {
        const result = updateReportStatusSchema.safeParse({ status: ReportStatus.APPROVED });
        expect(result.success).toBe(true);
    });

    it('should validate DECLINED status', () => {
        const result = updateReportStatusSchema.safeParse({ status: ReportStatus.DECLINED });
        expect(result.success).toBe(true);
    });

    it('should validate SUBMITTED status', () => {
        const result = updateReportStatusSchema.safeParse({ status: ReportStatus.SUBMITTED });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid status', () => {
        const result = updateReportStatusSchema.safeParse({ status: 'InvalidStatus' });
        expect(result.success).toBe(false);
    });

    it('should fail with CREATED status (not allowed)', () => {
        const result = updateReportStatusSchema.safeParse({ status: ReportStatus.CREATED });
        expect(result.success).toBe(false);
    });
});
