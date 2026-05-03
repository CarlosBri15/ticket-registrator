/**
 * Grid templates for list/table rows used across feature screens.
 *
 * Each layout is a `grid-template-columns` string applied via `style={{}}`
 * because Tailwind cannot statically generate arbitrary `grid-cols-[...]`
 * values that include mixed units (px / fr) for narrow icon + chevron slots.
 *
 * Convention: first 32px column hosts the row icon; last 16px column hosts
 * the chevron / hover affordance.
 */

/** Reports list — 6 columns: icon, name+type, status, dates, amount, chevron. */
export const REPORT_GRID = "32px 1fr 120px 148px 100px 16px";

/** Tickets list — 5 columns: icon, name+report, status, payment, chevron. */
export const TICKET_GRID = "32px 1fr 140px 120px 16px";

/** Tickets table (detail view) — 7 columns with finer breakdown. */
export const TICKETS_TABLE_GRID = "32px 1fr 100px 120px 120px 100px 16px";

/** Users list — 5 columns: avatar, name+email, role, scope, chevron. */
export const USER_GRID = "32px 1fr 1.2fr 140px 16px";

/** Departments list — 4 columns: icon, name, member count, chevron. */
export const DEPT_GRID = "32px 1fr 80px 16px";

/** Roles list — 4 columns: icon, name, hierarchy level, chevron. */
export const ROLE_GRID = "32px 1fr 120px 16px";

/** Organizations list — 4 columns: icon, name, member count, chevron. */
export const ORG_GRID = "32px 1fr 140px 16px";
