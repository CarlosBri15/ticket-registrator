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
  brand:          '#4D4DFF',
  brandHover:     '#3A3AC2',
  brandLight:     '#7575FF',
  secondary:      '#F2EBDC',
  secondaryLight: '#F8F4EC',
  dark:           '#1A1A1A',
  surface:        '#F5F5F5',

  // Semantic
  success: '#00C896',
  warning: '#FFD700',
  danger:  '#FF4B4B',
  info:    '#4D4DFF',
} as const;

export const fonts = {
  regular:  'SpaceGrotesk-Regular',
  medium:   'SpaceGrotesk-Medium',
  semiBold: 'SpaceGrotesk-SemiBold',
  bold:     'SpaceGrotesk-Bold',
} as const;

// ── Status Badge Map (Internal Use) ──
const STATUS_COLORS = {
  CREATED: '#FF7F50', // Stronger Orange/Coral
};

// ─── Border Radius ────────────────────────────────────────────────────────────
// Tailwind class names — work in both TailwindCSS and NativeWind v2.

export const radius = {
  /** 8px — small items */
  sm:   'rounded-lg',
  /** 12px — inputs, buttons */
  base: 'rounded-xl',
  /** 20px — cards, modals (approximated from image) */
  card: 'rounded-[20px]',
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
  base:  'border-2 border-black',
  thick: 'border-4 border-black',
  thin:  'border border-black',
  none:  'border-0',
} as const;

// ─── Neobrutalista Shadows ────────────────────────────────────────────────────
// Raw CSS box-shadow values for use in tailwind.config (mobile) or @theme (web).
// Both platforms reference these constants so shadow look stays in sync.

export const shadows = {
  /** 4px hard black shadow — standard card/button */
  hard:   '4px 4px 0px #1A1A1A',
  /** 2px hard black shadow — badges, small elements */
  hardSm: '2px 2px 0px #1A1A1A',
  /** 6px hard black shadow — hero cards, prominent elements */
  hardLg: '6px 6px 0px #1A1A1A',
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
