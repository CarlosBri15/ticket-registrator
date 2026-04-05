// ─── Status filter sets ───────────────────────────────────────────────────────
// Re-exported from shared so all features import from one place.
export {
  STATUS_OPTIONS,
  ACTIVE_STATUSES,
  PENDING_STATUSES,
  COMPLETED_STATUSES,
  isCurrentReport,
} from '@ticket-registrator/shared';

export const HISTORY_LIMIT = 5;

// ─── Design tokens (report screens only) ─────────────────────────────────────
// These are web-only inline-style values — they stay in the frontend.

export const DARK   = "#1A1A1A";
export const BORDER = "var(--color-border-main, #E4E4E7)";
export const SHADOW = "var(--color-shadow-main, #D4D4D8)";
export const BRAND  = "#3B82F6";
