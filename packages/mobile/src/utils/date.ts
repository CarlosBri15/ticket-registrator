import { type IReport } from '@ticket-registrator/shared';
import { format, type Locale } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

/**
 * Checks if a report is relevant to the "Current" (Today) view.
 * A report is current if today is between start_date and end_date.
 */
export const isCurrentReport = (r: IReport): boolean => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(r.start_date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(r.end_date);
  end.setHours(23, 59, 59, 999);
  return today >= start && today <= end;
};

/**
 * Returns the date locale based on the i18n language.
 */
export const getDateLocale = (language: string): Locale => {
  return language.startsWith('es') ? es : enUS;
};

/**
 * Formats a report's date range to a human-readable string.
 */
export const formatReportDateRange = (date: string | Date, locale: Locale) => {
  return format(new Date(date), 'd MMM yyyy', { locale });
};
