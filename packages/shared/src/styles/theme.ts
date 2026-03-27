/**
 * Shared Design Tokens — platform-agnostic values used by both web and mobile.
 *
 * ⚠️  Only include tokens that work in both Tailwind CSS (web) and NativeWind v2 (mobile).
 *     Web-only tokens (shadows, transitions, hover/focus states, animations) stay in
 *     packages/frontend/src/styles/theme.ts.
 */

// ─── Color Palette ────────────────────────────────────────────────────────────
// Raw hex values — used when you need a color in a JS context (e.g. icon tints,
// chart colors, StyleSheet values in React Native).

export const colors = {
  brand:          '#5b8fcb',
  brandHover:     '#4878b8',
  brandLight:     '#8ab4de',
  secondary:      '#c5daf0',
  secondaryLight: '#f0f6fd',
  dark:           '#1e293b',
  surface:        '#f8fafc',

  // Semantic
  success: '#059669',
  warning: '#d97706',
  danger:  '#dc2626',
  info:    '#0284c7',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
// Tailwind class names — work in both TailwindCSS and NativeWind v2.

export const radius = {
  /** 6px — small badges, tags */
  sm:   'rounded-md',
  /** 8px — inputs, buttons, small cards */
  base: 'rounded-lg',
  /** 12px — cards, modals, containers */
  card: 'rounded-xl',
  /** 9999px — avatars, pills, full-round badges */
  full: 'rounded-full',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────
// Class strings shared between web and mobile.
// Excludes: tracking-tight (not supported in NativeWind v2).

export const text = {
  /** Page titles */
  heading:    'text-lg font-semibold text-dark',
  /** Card / section titles */
  subheading: 'text-base font-semibold text-dark',
  /** Body text */
  body:       'text-sm text-slate-600',
  /** Form labels */
  label:      'text-xs font-bold text-slate-400 uppercase',
  /** Captions, hints */
  caption:    'text-xs text-slate-400',
  /** Large stat numbers */
  stat:       'text-2xl font-bold text-dark',
  /** Small stat numbers */
  statSm:     'text-xl font-bold text-dark',
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────

export const spacing = {
  /** Card padding */
  card:  'p-5',
  /** Card padding horizontal only */
  cardX: 'px-5',
  /** Card padding vertical only */
  cardY: 'py-5',
  /** Section gap between cards */
  section: 'gap-6',
  /** Form fields gap */
  form:    'gap-4',
  /** Input internal padding */
  input:   'px-4 py-3',
} as const;
