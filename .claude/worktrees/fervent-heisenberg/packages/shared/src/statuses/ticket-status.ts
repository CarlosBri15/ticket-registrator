export const TicketStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type TicketStatusType =
  typeof TicketStatus[keyof typeof TicketStatus];
