import { ReportStatus } from './report-status';

describe('ReportStatus', () => {
    it('should have CREATED status', () => {
        expect(ReportStatus.CREATED).toBe('Created');
    });

    it('should have SUBMITTED status', () => {
        expect(ReportStatus.SUBMITTED).toBe('Submitted');
    });

    it('should have APPROVED status', () => {
        expect(ReportStatus.APPROVED).toBe('Approved');
    });

    it('should have DECLINED status', () => {
        expect(ReportStatus.DECLINED).toBe('Declined');
    });

    it('should have exactly 4 statuses', () => {
        expect(Object.keys(ReportStatus)).toHaveLength(4);
    });
});
