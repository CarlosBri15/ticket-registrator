import { format } from "date-fns";
import type { IReport } from "@ticket-registrator/shared";

export interface MonthlyExpense {
  month: string;      // "Jan 25"
  monthKey: string;   // "2025-01" for sorting
  amount: number;
  count: number;
}

export interface TypeExpense {
  type: string;
  amount: number;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

/**
 * Groups reports by the month of their end_date and sums requested_amount.
 * Returns the last `maxMonths` months with data, sorted oldest → newest.
 */
export function getMonthlyExpenses(
  reports: IReport[],
  maxMonths = 6,
): MonthlyExpense[] {
  const map = new Map<string, MonthlyExpense>();

  for (const report of reports) {
    if (!report.end_date) continue;
    const date = new Date(report.end_date);
    const key = format(date, "yyyy-MM");
    const label = format(date, "MMM yy");

    const existing = map.get(key);
    if (existing) {
      existing.amount += report.requested_amount || 0;
      existing.count += 1;
    } else {
      map.set(key, {
        month: label,
        monthKey: key,
        amount: report.requested_amount || 0,
        count: 1,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .slice(-maxMonths);
}

/**
 * Groups reports by trip type and sums requested_amount.
 * Reports without a type are grouped under "Other".
 */
export function getExpensesByType(
  reports: IReport[],
  otherLabel = "Other",
): TypeExpense[] {
  const map = new Map<string, TypeExpense>();

  for (const report of reports) {
    const type = report.type?.trim() || otherLabel;
    const existing = map.get(type);
    if (existing) {
      existing.amount += report.requested_amount || 0;
      existing.count += 1;
    } else {
      map.set(type, { type, amount: report.requested_amount || 0, count: 1 });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

/**
 * Counts reports by their status.
 */
export function getStatusCounts(reports: IReport[]): StatusCount[] {
  const map = new Map<string, number>();

  for (const report of reports) {
    const status = report.status ?? "Unknown";
    map.set(status, (map.get(status) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Filters reports by name search query (case-insensitive).
 */
export function filterBySearch(reports: IReport[], query: string): IReport[] {
  if (!query.trim()) return reports;
  const q = query.toLowerCase();
  return reports.filter((r) => r.name?.toLowerCase().includes(q));
}

/**
 * Filters reports by status. Pass "ALL" to skip filtering.
 */
export function filterByStatus(reports: IReport[], status: string): IReport[] {
  if (!status || status === "ALL") return reports;
  return reports.filter((r) => r.status.toUpperCase() === status.toUpperCase());
}

/**
 * Filters reports whose end_date falls within [from, to] (inclusive).
 * Dates are ISO strings "YYYY-MM-DD". Null/empty = no bound.
 */
export function filterByDateRange(
  reports: IReport[],
  from: string | null,
  to: string | null,
): IReport[] {
  return reports.filter((r) => {
    if (!r.end_date) return true;
    const endDate = r.end_date.substring(0, 10);
    if (from && endDate < from) return false;
    if (to && endDate > to) return false;
    return true;
  });
}
