export const ItemStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PARTIALLY_APPROVED: 'Partially_approved',
} as const;

export type ItemStatusType = typeof ItemStatus[keyof typeof ItemStatus];
