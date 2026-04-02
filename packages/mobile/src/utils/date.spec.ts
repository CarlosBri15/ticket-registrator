import { isCurrentReport, getDateLocale, formatReportDateRange } from './date';
import { enUS, es } from 'date-fns/locale';

describe('date utils', () => {
  describe('isCurrentReport', () => {
    it('returns true if today is within range', () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 1);
      const end = new Date(today);
      end.setDate(today.getDate() + 1);

      const report = {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      } as any;

      expect(isCurrentReport(report)).toBe(true);
    });

    it('returns false if today is before range', () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + 1);
      const end = new Date(today);
      end.setDate(today.getDate() + 2);

      const report = {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      } as any;

      expect(isCurrentReport(report)).toBe(false);
    });

    it('returns false if today is after range', () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 2);
      const end = new Date(today);
      end.setDate(today.getDate() - 1);

      const report = {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      } as any;

      expect(isCurrentReport(report)).toBe(false);
    });
  });

  describe('getDateLocale', () => {
    it('returns Spanish locale for "es"', () => {
      expect(getDateLocale('es')).toBe(es);
      expect(getDateLocale('es-ES')).toBe(es);
    });

    it('returns English locale for other languages', () => {
      expect(getDateLocale('en')).toBe(enUS);
      expect(getDateLocale('fr')).toBe(enUS);
    });
  });

  describe('formatReportDateRange', () => {
    it('formats date correctly in English', () => {
      const date = new Date(2025, 0, 15); // Jan 15th
      expect(formatReportDateRange(date, enUS)).toBe('15 Jan 2025');
    });

    it('formats date correctly in Spanish', () => {
      const date = new Date(2025, 0, 15);
      const result = formatReportDateRange(date, es);
      expect(result.toLowerCase()).toContain('ene');
      expect(result).toContain('2025');
    });
  });
});
