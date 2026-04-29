import { IReport, ReportStatusType } from '@ticket-registrator/shared';
import { mapTicketToITicket } from '../../tickets/mapper/ticket.mapper';
import { ReportWithTickets } from '../schemas/report.schema';

export const mapReportToIReport = (reportDoc: ReportWithTickets): IReport => ({
  id: reportDoc.id,
  user_id: reportDoc.userId,
  name: reportDoc.name,
  start_date: reportDoc.startDate.toISOString(),
  end_date: reportDoc.endDate.toISOString(),
  currency: reportDoc.currency,
  type: reportDoc.type ?? '',
  requested_amount: reportDoc.requestedAmount,
  approved_amount: reportDoc.approvedAmount,
  status: reportDoc.status as ReportStatusType,
  tickets: reportDoc.tickets
    ? reportDoc.tickets.map((t) => mapTicketToITicket(t))
    : undefined,
  createdAt: reportDoc.createdAt.toISOString(),
  updatedAt: reportDoc.updatedAt.toISOString(),
});
