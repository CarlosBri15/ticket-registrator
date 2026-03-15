import { IReport, ReportStatusType } from '@ticket-registrator/shared';
import { Report } from '../schemas/report.schema';

export const mapReportToIReport = (reportDoc: Report): IReport => ({
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
  createdAt: reportDoc.createdAt.toISOString(),
  updatedAt: reportDoc.updatedAt.toISOString(),
});
