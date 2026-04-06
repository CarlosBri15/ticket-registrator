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
  // Brand — Grafito (near-black warm)
  brand:          '#1C1917',
  brandHover:     '#2A2724',
  brandLight:     '#F5F4F0',

  // Sidebar — warm cream
  sidebar:        '#F5F4F0',
  sidebarAccent:  '#ECEAE7',
  sidebarText:    '#1C1917',
  sidebarHover:   '#F7F6F3',

  // Warm neutral surfaces (cream-forward)
  secondary:      '#F5F4F0',
  secondaryLight: '#F7F6F3',

  dark:    '#1C1917',   // stone-950, warm near-black
  surface: '#FFFFFF',  // pure white body background

  // Semantic
  success: '#16A34A',   // green-600
  warning: '#D97706',   // amber-600
  danger:  '#DC2626',   // red-600
  info:    '#2563EB',
} as const;

export const fonts = {
  family:   'Satoshi',
  regular:  'Satoshi-Regular',
  medium:   'Satoshi-Medium',
  semiBold: 'Satoshi-Bold',
  bold:     'Satoshi-Black',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   'rounded-[4px]',
  base: 'rounded-[4px]',
  card: 'rounded-[8px]',
  full: 'rounded-full',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────

export const text = {
  heading:    'text-2xl font-space-bold text-dark tracking-tight',
  subheading: 'text-base font-space-bold text-dark',
  body:       'text-sm font-space-medium text-dark/80',
  label:      'text-xs font-space-bold text-dark uppercase tracking-widest',
  caption:    'text-[10px] font-space-bold text-dark/40 uppercase tracking-widest',
  stat:       'text-3xl font-space-bold text-dark',
  statSm:     'text-2xl font-space-bold text-dark',
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────

export const spacing = {
  card:    'p-5',
  cardX:   'px-5',
  cardY:   'py-5',
  section: 'gap-6',
  form:    'gap-4',
  input:   'px-4 py-3',
} as const;

// ─── Borders ──────────────────────────────────────────────────────────────────

export const borders = {
  base:  'border border-zinc-200',
  thick: 'border-2 border-zinc-200',
  thin:  'border border-zinc-200/50',
  none:  'border-0',
} as const;

// ─── Shadows (mobile / neobrutalista) ────────────────────────────────────────
// Raw CSS box-shadow values consumed by mobile's tailwind.config.
// Web uses its own soft-shadow CSS variables in index.css instead.

export const shadows = {
  hard:   '4px 4px 0px #A1A1AA',
  hardSm: '3px 3px 0px #A1A1AA',
  micro:  '2px 2px 0px #A1A1AA',
} as const;

// ─── Status Colors ────────────────────────────────────────────────────────────
// Platform-agnostic hex values for each report/ticket status.
// Both web StatusBadge and mobile StatusBadge read from here.

export const statusColors = {
  DRAFT:     { bg: '#F5F4F0', text: '#78716C', dot: '#A8A29E' },   // warm stone
  CREATED:   { bg: '#EFF6FF', text: '#1D4ED8', dot: '#60A5FA' },   // soft blue
  PENDING:   { bg: '#FFFBEB', text: '#92400E', dot: '#FBBF24' },   // warm amber
  SUBMITTED: { bg: '#FFF7ED', text: '#9A3412', dot: '#FB923C' },   // soft orange
  APPROVED:  { bg: '#F0FDF4', text: '#15803D', dot: '#4ADE80' },   // soft green
  PAID:      { bg: '#ECFDF5', text: '#047857', dot: '#34D399' },   // soft emerald
  REJECTED:  { bg: '#FFF1F2', text: '#BE123C', dot: '#FB7185' },   // soft rose
  DECLINED:  { bg: '#FFF1F2', text: '#BE123C', dot: '#FB7185' },   // soft rose
} as const;

// ─── Role Colors ──────────────────────────────────────────────────────────────

export const roleColors = {
  EMPLOYEE:   { bg: '#475569', text: '#FFFFFF' },
  MANAGER:    { bg: '#0284C7', text: '#FFFFFF' },
  CONTROLLER: { bg: '#059669', text: '#FFFFFF' },
  ADMIN:      { bg: '#DC2626', text: '#FFFFFF' },
  SUPERADMIN: { bg: '#6D28D9', text: '#FFFFFF' },
} as const;

// ─── Design System Numeric Tokens ─────────────────────────────────────────────
// Raw numeric values for component props (shadowOffset, borderRadius).
// Consumed by both web PixelCard and mobile PixelCard.

export const nbTokens = {
  radiusCard:  12,
  radiusBadge: 4,
  shadowCard:  0,
  shadowBadge: 0,
  shadowMicro: 0,
} as const;
