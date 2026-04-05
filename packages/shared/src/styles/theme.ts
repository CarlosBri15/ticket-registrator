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
  brand:          '#3B82F6',
  brandHover:     '#2563EB',
  brandLight:     '#93C5FD',
  sidebar:        '#FFFFFF',
  sidebarAccent:  '#F4F4F5',
  sidebarText:    '#1A1A1A',
  sidebarHover:   '#FAFAFA',
  secondary:      '#F2EBDC',
  secondaryLight: '#F8F4EC',
  dark:           '#1A1A1A',
  surface:        '#EDEDF0',

  // Semantic
  success: '#00C896',
  warning: '#FFD700',
  danger:  '#FF4B4B',
  info:    '#3B82F6',
} as const;

export const fonts = {
  family:   'Satoshi',
  regular:  'Satoshi-Regular',
  medium:   'Satoshi-Medium',
  semiBold: 'Satoshi-Bold',
  bold:     'Satoshi-Black',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
// Tailwind class names — work in both TailwindCSS and NativeWind v2.

export const radius = {
  /** 4px — badges, small items */
  sm:   'rounded-[4px]',
  /** 4px — legacy base, unified to sm */
  base: 'rounded-[4px]',
  /** 8px — cards, modals */
  card: 'rounded-[8px]',
  /** Full pill */
  full: 'rounded-full',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────

export const text = {
  /** Page titles - Bold Pixel-esque */
  heading:    'text-2xl font-space-bold text-dark tracking-tight',
  /** Card / section titles */
  subheading: 'text-base font-space-bold text-dark',
  /** Body text */
  body:       'text-sm font-space-medium text-dark/80',
  /** Form labels */
  label:      'text-xs font-space-bold text-dark uppercase tracking-widest',
  /** Captions, hints */
  caption:    'text-[10px] font-space-bold text-dark/40 uppercase tracking-widest',
  /** Large stat numbers */
  stat:       'text-3xl font-space-bold text-dark',
  /** Small stat numbers */
  statSm:     'text-2xl font-space-bold text-dark',
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

// ─── Borders ──────────────────────────────────────────────────────────────────

export const borders = {
  base:  'border-2 border-zinc-300',
  thick: 'border-4 border-zinc-300',
  thin:  'border border-zinc-300',
  none:  'border-0',
} as const;

// ─── Neobrutalista Shadows ────────────────────────────────────────────────────
// Raw CSS box-shadow values for use in tailwind.config (mobile) or @theme (web).
// Both platforms reference these constants so shadow look stays in sync.

export const shadows = {
  /** 4px hard grey shadow — standard card/button */
  hard:   '4px 4px 0px #A1A1AA',
  /** 3px hard grey shadow — badges, small elements */
  hardSm: '3px 3px 0px #A1A1AA',
  /** 2px hard grey shadow — micro elements (counters) */
  micro:  '2px 2px 0px #A1A1AA',
} as const;

// ─── Status Colors ────────────────────────────────────────────────────────────
// Platform-agnostic hex values for each report/ticket status.
// Both web StatusBadge and mobile StatusBadge read from here.

export const statusColors = {
  DRAFT:     { bg: '#1A1A1A', text: '#FFFFFF' },
  CREATED:   { bg: '#FF7F50', text: '#FFFFFF' },
  PENDING:   { bg: '#E6B800', text: '#FFFFFF' },
  SUBMITTED: { bg: '#E6B800', text: '#FFFFFF' },
  APPROVED:  { bg: '#00C896', text: '#FFFFFF' },
  PAID:      { bg: '#00C896', text: '#FFFFFF' },
  REJECTED:  { bg: '#FF4B4B', text: '#FFFFFF' },
  DECLINED:  { bg: '#FF4B4B', text: '#FFFFFF' },
} as const;

// ─── Status Border & Shadow Colors ────────────────────────────────────────────
// Neobrutalista border and drop-shadow colors per status.
// Used by StatusBadge on both web and mobile for the hard-shadow effect.

export const statusBorderColors = {
  DRAFT:     { border: '#000000', shadow: '#000000' },
  CREATED:   { border: '#E66B40', shadow: '#B35333' },
  PENDING:   { border: '#B38F00', shadow: '#806600' },
  SUBMITTED: { border: '#B38F00', shadow: '#806600' },
  APPROVED:  { border: '#009B74', shadow: '#006E52' },
  PAID:      { border: '#009B74', shadow: '#006E52' },
  REJECTED:  { border: '#DC2626', shadow: '#991B1B' },
  DECLINED:  { border: '#DC2626', shadow: '#991B1B' },
} as const;

// ─── Role Colors ──────────────────────────────────────────────────────────────
// Platform-agnostic hex values for each user role.
// Used by RoleBadge on web and mobile.

export const roleColors = {
  EMPLOYEE:   { bg: '#475569', text: '#FFFFFF' },
  MANAGER:    { bg: '#0284C7', text: '#FFFFFF' },
  CONTROLLER: { bg: '#059669', text: '#FFFFFF' },
  ADMIN:      { bg: '#DC2626', text: '#FFFFFF' },
  SUPERADMIN: { bg: '#6D28D9', text: '#FFFFFF' },
} as const;

export const roleBorderColors = {
  EMPLOYEE:   { border: '#334155', shadow: '#1E293B' },
  MANAGER:    { border: '#0369A1', shadow: '#075985' },
  CONTROLLER: { border: '#047857', shadow: '#064E3B' },
  ADMIN:      { border: '#B91C1C', shadow: '#7F1D1D' },
  SUPERADMIN: { border: '#5B21B6', shadow: '#4C1D95' },
} as const;

// ─── Neobrutalist Design System (Specific Tokens) ──────────────────────────────
// Raw numeric values for use in component props (shadowOffset, borderRadius)

export const nbTokens = {
  radiusCard: 8,
  radiusBadge: 4,
  shadowCard: 4,
  shadowBadge: 3,
  shadowMicro: 2,
} as const;
