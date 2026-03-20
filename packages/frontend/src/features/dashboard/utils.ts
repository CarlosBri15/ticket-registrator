import { ReportStatus } from "@ticket-registrator/shared";
import type { IReport } from "@ticket-registrator/shared";
import { format } from "date-fns";
import type { Locale } from "date-fns";

export const getStatusClasses = (status: string) => {
  const s = status.toUpperCase();
  if (s === "APPROVED" || s === ReportStatus.APPROVED.toUpperCase()) return "bg-green-50 text-green-600";
  if (s === "DECLINED" || s === "REJECTED" || s === ReportStatus.DECLINED.toUpperCase()) return "bg-red-50 text-accent";
  return "bg-gray-50 text-gray-400";
};

export const getReportsSummary = (reports: IReport[]) =>
  reports.reduce(
    (acc, r) => {
      const status = r.status.toUpperCase();
      if (["CREATED", "DRAFT", "PENDING", "SUBMITTED"].includes(status)) acc.active.push(r);
      if (["APPROVED", "PAID", "REJECTED", "DECLINED"].includes(status)) acc.completed.push(r);
      if (status === "SUBMITTED") acc.pending.push(r);
      return acc;
    },
    { active: [] as IReport[], completed: [] as IReport[], pending: [] as IReport[] },
  );

export const getAmountsSummary = (reports: IReport[]) =>
  reports.reduce(
    (acc, r) => {
      const s = r.status.toUpperCase();
      if (s === "SUBMITTED") acc.pending += r.requested_amount;
      if (s === "APPROVED") acc.approved += r.approved_amount || 0;
      if (s === "DECLINED" || s === "REJECTED") acc.rejectedCount++;
      return acc;
    },
    { pending: 0, approved: 0, rejectedCount: 0 },
  );

/** Returns orgs created in the current calendar month */
export const countCreatedThisMonth = (items: Array<{ createdAt: string }>): number => {
  const now = new Date();
  return items.filter((item) => {
    const d = new Date(item.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
};

/** Builds monthly creation counts for the last N months (oldest → newest) */
export const buildMonthlyGrowth = (
  items: Array<{ createdAt: string }>,
  months: number,
  locale: Locale,
): Array<{ month: string; count: number }> => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const count = items.filter((item) => {
      const c = new Date(item.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    return { month: format(d, "MMM", { locale }), count };
  });
};
