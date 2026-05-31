/**
 * Mobile theme constants — thin re-export of the shared design tokens plus
 * RN-specific numeric values that `StyleSheet.create` callsites consume.
 *
 * Single source of truth for hex/rgba values is
 * `packages/shared/src/styles/theme.ts`. NEVER inline hex/rgba literals at a
 * call-site — import a semantic token from here instead.
 */

import { colors as sharedColors } from '@ticket-registrator/shared';

export const colors = sharedColors;

// ── RN-numeric tokens (StyleSheet only) ─────────────────────────────────────

export const UI = {
  BORDER_WIDTH: 1,
  RADIUS:       14,
  SHADOW_OFFSET: 1,
} as const;

/** Soft elevation used by mobile cards / modal containers. */
export const SHADOW_HARD = {
  shadowColor:   colors.fgPrimary,
  shadowOffset:  { width: 0, height: UI.SHADOW_OFFSET },
  shadowOpacity: 0.06,
  shadowRadius:  3,
  elevation:     2,
} as const;
