import { IReport } from '@ticket-registrator/shared';
import { ReportDocument } from '../schemas/report.schema';

export const mapReportToIReport = (
  reportDoc: ReportDocument
): IReport => ({
  id: reportDoc._id.toString(),
  user_id: reportDoc.user_id.toString(),
  name: reportDoc.name,
  start_date: reportDoc.start_date.toISOString(),
  end_date: reportDoc.end_date.toISOString(),
  currency: reportDoc.currency,
  type: reportDoc.type ?? '',
  requested_amount: reportDoc.requested_amount,
  approved_amount: reportDoc.approved_amount,
  status: reportDoc.status,
  isVisible: reportDoc.isVisible,
  createdAt: reportDoc.createdAt.toISOString(),
  updatedAt: reportDoc.updatedAt.toISOString(),
});
