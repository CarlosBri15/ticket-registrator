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

export const DARK   = "#1C1917";
export const BORDER = "var(--color-border-main, #E5E4E0)";
export const SHADOW = "var(--color-shadow-main, #E5E4E0)";
export const BRAND  = "#FACC15";
