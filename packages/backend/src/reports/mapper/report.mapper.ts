import {
  IReport,
  IReportCategoryMix,
  ReportStatusType,
} from '@ticket-registrator/shared';
import { mapTicketToITicket } from '../../tickets/mapper/ticket.mapper';
import { ReportWithTickets } from '../schemas/report.schema';

const UNCATEGORIZED_KEY = '__uncategorized__';

const buildCategoryMix = (
  reportDoc: ReportWithTickets,
): IReportCategoryMix[] => {
  const tickets = reportDoc.tickets ?? [];
  if (tickets.length === 0) return [];

  type Bucket = {
    categoryId: string | null;
    categoryName: string;
    categoryColor: string | null;
    categoryIcon: string | null;
    amount: number;
  };

  const buckets = new Map<string, Bucket>();
  let total = 0;

  for (const ticket of tickets) {
    const items = ticket.items ?? [];
    for (const item of items) {
      const amount = item.amount ?? 0;
      if (amount <= 0) continue;
      total += amount;

      const key = item.categoryId ?? UNCATEGORIZED_KEY;
      const existing = buckets.get(key);
      if (existing) {
        existing.amount += amount;
        continue;
      }

      buckets.set(key, {
        categoryId: item.categoryId ?? null,
        categoryName: item.category?.name ?? 'Uncategorized',
        categoryColor: item.category?.color ?? null,
        categoryIcon: item.category?.icon ?? null,
        amount,
      });
    }
  }

  if (total === 0) return [];

  return Array.from(buckets.values())
    .sort((a, b) => b.amount - a.amount)
    .map((b) => ({
      ...b,
      percentage: Math.round((b.amount / total) * 1000) / 10,
    }));
};

export const mapReportToIReport = (reportDoc: ReportWithTickets): IReport => ({
  id: reportDoc.id,
  user_id: reportDoc.userId,
  userName: reportDoc.user?.name ?? null,
  userSurname: reportDoc.user?.surname ?? null,
  name: reportDoc.name,
  start_date: reportDoc.startDate.toISOString(),
  end_date: reportDoc.endDate.toISOString(),
  currency: reportDoc.currency,
  type: reportDoc.type ?? '',
  requested_amount: reportDoc.requestedAmount,
  approved_amount: reportDoc.approvedAmount,
  status: reportDoc.status as ReportStatusType,
  categoryMix: buildCategoryMix(reportDoc),
  tickets: reportDoc.tickets
    ? reportDoc.tickets.map((t) => mapTicketToITicket(t))
    : undefined,
  createdAt: reportDoc.createdAt.toISOString(),
  updatedAt: reportDoc.updatedAt.toISOString(),
});
