/**
 * Numeric hierarchy thresholds for role-based rendering decisions.
 * These values mirror the `hierarchy` field on IUser and are used
 * to determine which dashboard or UI variant to show.
 *
 * Keep in sync with the backend role definitions.
 */
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 99,
  MANAGER: 50,
  CONTROLLER: 40,
  REGULAR: 0,
} as const;
