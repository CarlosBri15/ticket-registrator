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

  describe('userName / userSurname propagation', () => {
    it('returns null on both when user relation absent', () => {
      const result = mapReportToIReport(baseReport);
      expect(result.userName).toBeNull();
      expect(result.userSurname).toBeNull();
    });

    it('mirrors users.name and users.surname when user is loaded', () => {
      const result = mapReportToIReport({
        ...baseReport,
        user: { name: 'Carlos', surname: 'Briasco' },
      });
      expect(result.userName).toBe('Carlos');
      expect(result.userSurname).toBe('Briasco');
    });

    it('falls back to null for user.name/surname when DB has nulls', () => {
      const result = mapReportToIReport({
        ...baseReport,
        user: { name: null, surname: null },
      });
      expect(result.userName).toBeNull();
      expect(result.userSurname).toBeNull();
    });
  });

  describe('categoryMix aggregation', () => {
    it('is empty when no tickets', () => {
      const result = mapReportToIReport(baseReport);
      expect(result.categoryMix).toEqual([]);
    });

    it('is empty when items have zero amount', () => {
      const result = mapReportToIReport({
        ...baseReport,
        tickets: [
          {
            items: [
              { categoryId: 'c1', amount: 0, category: { name: 'Meals', color: '#F5C842' } },
            ],
          },
        ],
      });
      expect(result.categoryMix).toEqual([]);
    });

    it('groups by categoryId, sorts by amount desc, computes percentage', () => {
      const result = mapReportToIReport({
        ...baseReport,
        tickets: [
          {
            items: [
              { categoryId: 'c1', amount: 30, category: { name: 'Meals', color: '#F5C842' } },
              { categoryId: 'c2', amount: 70, category: { name: 'Lodging', color: '#8A5E89' } },
            ],
          },
          {
            items: [
              { categoryId: 'c1', amount: 20, category: { name: 'Meals', color: '#F5C842' } },
            ],
          },
        ],
      });
      expect(result.categoryMix).toEqual([
        { categoryId: 'c2', categoryName: 'Lodging', categoryColor: '#8A5E89', amount: 70, percentage: 58.3 },
        { categoryId: 'c1', categoryName: 'Meals', categoryColor: '#F5C842', amount: 50, percentage: 41.7 },
      ]);
    });

    it('uses null categoryId/Color and "Uncategorized" name when item has no category', () => {
      const result = mapReportToIReport({
        ...baseReport,
        tickets: [
          {
            items: [
              { categoryId: null, amount: 40, category: null },
              { categoryId: 'c1', amount: 60, category: { name: 'Meals', color: '#F5C842' } },
            ],
          },
        ],
      });
      expect(result.categoryMix).toEqual([
        { categoryId: 'c1', categoryName: 'Meals', categoryColor: '#F5C842', amount: 60, percentage: 60 },
        { categoryId: null, categoryName: 'Uncategorized', categoryColor: null, amount: 40, percentage: 40 },
      ]);
    });
  });
});
