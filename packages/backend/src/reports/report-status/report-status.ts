export const ReportStatus = {
  CREATED: 'Created',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
} as const;

export type ReportStatusType =
  typeof ReportStatus[keyof typeof ReportStatus];
