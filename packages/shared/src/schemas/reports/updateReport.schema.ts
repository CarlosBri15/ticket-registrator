import { z } from 'zod';
import { ReportStatus } from '../../statuses/report-status';

export const updateReportFieldsSchema = z.object({
  name: z.string().min(1).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  type: z.string().optional(),
  isVisible: z.boolean().optional()
}).strict();

export const updateReportStatusSchema = z.object({
  status: z.enum([
    ReportStatus.APPROVED,
    ReportStatus.DECLINED,
    ReportStatus.SUBMITTED,
  ]),
}).strict();

export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;
export type UpdateReportFields = z.infer<typeof updateReportFieldsSchema>;
