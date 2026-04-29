// ─── Status filter sets ───────────────────────────────────────────────────────
// Shared across web and mobile — do not add platform-specific logic here.

export const STATUS_OPTIONS = [
  "ALL", "CREATED", "DRAFT", "PENDING", "SUBMITTED", "APPROVED", "DECLINED",
] as const;

/** Reports/tickets that are still in progress (not yet resolved). */
export const ACTIVE_STATUSES = new Set(["CREATED", "DRAFT", "PENDING", "SUBMITTED"]);

/** Reports that exist but have not been submitted yet. */
export const PENDING_STATUSES = new Set(["CREATED", "DRAFT"]);

/** Reports that have reached a terminal state. */
export const COMPLETED_STATUSES = new Set(["APPROVED", "PAID", "REJECTED", "DECLINED"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if today falls within the report's date range. */
export const isCurrentReport = (r: { start_date: string; end_date: string }): boolean => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(r.start_date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(r.end_date);
  end.setHours(23, 59, 59, 999);
  return today >= start && today <= end;
};
