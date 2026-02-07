export const TicketLifecycle = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
} as const;

export type TicketLifecycleType =
  typeof TicketLifecycle[keyof typeof TicketLifecycle];
