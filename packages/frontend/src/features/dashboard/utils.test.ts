import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enUS } from 'date-fns/locale';
import {
  getStatusClasses,
  getReportsSummary,
  getAmountsSummary,
  countCreatedThisMonth,
  buildMonthlyGrowth,
} from './utils';
import type { IReport } from '@ticket-registrator/shared';

type ReportTestOverrides = Partial<Omit<IReport, 'status' | 'approved_amount'>> & {
  status?: string;
  approved_amount?: number | null;
};

const mkReport = (overrides: ReportTestOverrides): IReport =>
  ({
    id: 'r',
    name: 'r',
    status: 'CREATED',
    requested_amount: 0,
    approved_amount: null,
    ...overrides,
  } as unknown as IReport);

describe('dashboard/utils', () => {
  describe('getStatusClasses', () => {
    it('returns green classes for APPROVED', () => {
      expect(getStatusClasses('APPROVED')).toBe('bg-green-50 text-green-600');
      expect(getStatusClasses('approved')).toBe('bg-green-50 text-green-600');
    });

    it('returns red classes for DECLINED and REJECTED', () => {
      expect(getStatusClasses('DECLINED')).toBe('bg-red-50 text-accent');
      expect(getStatusClasses('REJECTED')).toBe('bg-red-50 text-accent');
    });

    it('returns gray classes for any other status', () => {
      expect(getStatusClasses('SUBMITTED')).toBe('bg-gray-50 text-gray-400');
      expect(getStatusClasses('PENDING')).toBe('bg-gray-50 text-gray-400');
      expect(getStatusClasses('')).toBe('bg-gray-50 text-gray-400');
    });
  });

  describe('getReportsSummary', () => {
    it('classifies reports by status into active/completed/pending', () => {
      const reports: IReport[] = [
        mkReport({ id: '1', status: 'CREATED' }),
        mkReport({ id: '2', status: 'DRAFT' }),
        mkReport({ id: '3', status: 'PENDING' }),
        mkReport({ id: '4', status: 'SUBMITTED' }),
        mkReport({ id: '5', status: 'APPROVED' }),
        mkReport({ id: '6', status: 'PAID' }),
        mkReport({ id: '7', status: 'REJECTED' }),
        mkReport({ id: '8', status: 'DECLINED' }),
      ];
      const result = getReportsSummary(reports);
      expect(result.active.map((r) => r.id)).toEqual(['1', '2', '3', '4']);
      expect(result.completed.map((r) => r.id)).toEqual(['5', '6', '7', '8']);
      expect(result.pending.map((r) => r.id)).toEqual(['4']);
    });

    it('returns empty buckets for empty input', () => {
      const result = getReportsSummary([]);
      expect(result).toEqual({ active: [], completed: [], pending: [] });
    });

    it('is case-insensitive', () => {
      const reports = [mkReport({ status: 'submitted' as any })];
      const result = getReportsSummary(reports);
      expect(result.active).toHaveLength(1);
      expect(result.pending).toHaveLength(1);
    });
  });

  describe('getAmountsSummary', () => {
    it('sums requested amounts for SUBMITTED reports', () => {
      const reports = [
        mkReport({ status: 'SUBMITTED', requested_amount: 100 }),
        mkReport({ status: 'SUBMITTED', requested_amount: 50 }),
      ];
      expect(getAmountsSummary(reports).pending).toBe(150);
    });

    it('sums approved_amount for APPROVED reports (treats null as 0)', () => {
      const reports = [
        mkReport({ status: 'APPROVED', approved_amount: 200 }),
        mkReport({ status: 'APPROVED', approved_amount: null }),
        mkReport({ status: 'APPROVED', approved_amount: 50 }),
      ];
      expect(getAmountsSummary(reports).approved).toBe(250);
    });

    it('counts DECLINED and REJECTED reports', () => {
      const reports = [
        mkReport({ status: 'DECLINED' }),
        mkReport({ status: 'REJECTED' }),
        mkReport({ status: 'APPROVED', approved_amount: 100 }),
      ];
      expect(getAmountsSummary(reports).rejectedCount).toBe(2);
    });

    it('returns zeroes for an empty list', () => {
      expect(getAmountsSummary([])).toEqual({ pending: 0, approved: 0, rejectedCount: 0 });
    });
  });

  describe('countCreatedThisMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('counts only items created in the current month', () => {
      const items = [
        { createdAt: '2024-06-01T00:00:00.000Z' },
        { createdAt: '2024-06-30T00:00:00.000Z' },
        { createdAt: '2024-05-31T00:00:00.000Z' },
        { createdAt: '2023-06-15T00:00:00.000Z' },
      ];
      expect(countCreatedThisMonth(items)).toBe(2);
    });

    it('returns 0 for an empty list', () => {
      expect(countCreatedThisMonth([])).toBe(0);
    });
  });

  describe('buildMonthlyGrowth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns an array with one entry per requested month, oldest first', () => {
      const items = [
        { createdAt: '2024-04-10T00:00:00.000Z' },
        { createdAt: '2024-05-05T00:00:00.000Z' },
        { createdAt: '2024-05-25T00:00:00.000Z' },
        { createdAt: '2024-06-01T00:00:00.000Z' },
      ];
      const growth = buildMonthlyGrowth(items, 3, enUS);
      expect(growth).toHaveLength(3);
      expect(growth[0].count).toBe(1);
      expect(growth[1].count).toBe(2);
      expect(growth[2].count).toBe(1);
    });

    it('formats months using the provided locale', () => {
      const growth = buildMonthlyGrowth([], 1, enUS);
      expect(growth[0].month).toMatch(/^[A-Za-z]+$/);
    });

    it('handles months=0', () => {
      expect(buildMonthlyGrowth([], 0, enUS)).toEqual([]);
    });
  });
});
