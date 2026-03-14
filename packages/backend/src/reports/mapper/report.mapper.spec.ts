import { mapReportToIReport } from './report.mapper';
import { ReportStatus } from '@ticket-registrator/shared';

describe('mapReportToIReport', () => {
  const now = new Date('2024-06-01T10:00:00.000Z');
  const start = new Date('2024-05-01T00:00:00.000Z');
  const end = new Date('2024-05-31T00:00:00.000Z');

  const baseReport = {
    id: 'report-1',
    userId: 'user-1',
    name: 'May Trip',
    startDate: start,
    endDate: end,
    currency: 'USD',
    type: 'travel',
    requestedAmount: 200.5,
    approvedAmount: 180.0,
    status: ReportStatus.CREATED,
    createdAt: now,
    updatedAt: now,
  } as any;

  it('should map all scalar fields correctly', () => {
    const result = mapReportToIReport(baseReport);

    expect(result.id).toBe('report-1');
    expect(result.user_id).toBe('user-1');
    expect(result.name).toBe('May Trip');
    expect(result.currency).toBe('USD');
    expect(result.type).toBe('travel');
    expect(result.requested_amount).toBe(200.5);
    expect(result.approved_amount).toBe(180.0);
    expect(result.status).toBe(ReportStatus.CREATED);
  });

  it('should convert startDate to ISO string', () => {
    const result = mapReportToIReport(baseReport);
    expect(result.start_date).toBe(start.toISOString());
  });

  it('should convert endDate to ISO string', () => {
    const result = mapReportToIReport(baseReport);
    expect(result.end_date).toBe(end.toISOString());
  });

  it('should convert createdAt to ISO string', () => {
    const result = mapReportToIReport(baseReport);
    expect(result.createdAt).toBe(now.toISOString());
  });

  it('should convert updatedAt to ISO string', () => {
    const result = mapReportToIReport(baseReport);
    expect(result.updatedAt).toBe(now.toISOString());
  });

  it('should default type to empty string when type is null', () => {
    const result = mapReportToIReport({ ...baseReport, type: null });
    expect(result.type).toBe('');
  });

  it('should default type to empty string when type is undefined', () => {
    const result = mapReportToIReport({ ...baseReport, type: undefined });
    expect(result.type).toBe('');
  });

  it('should not expose internal DB field names (camelCase)', () => {
    const result = mapReportToIReport(baseReport);
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('startDate');
    expect(result).not.toHaveProperty('endDate');
    expect(result).not.toHaveProperty('requestedAmount');
    expect(result).not.toHaveProperty('approvedAmount');
  });
});
