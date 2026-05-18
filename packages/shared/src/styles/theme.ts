/**
 * Shared Design Tokens — platform-agnostic values used by both web and mobile.
 *
 * Aligned with the web kit in `packages/frontend/src/index.css` (Chromatic v2):
 * grafito brand, cream surface, Manrope, stone-warm palette, soft shadows.
 *
 * ⚠️  Only include tokens that work in both Tailwind CSS (web) and NativeWind v2
 *     (mobile). Web-only tokens (transitions, hover/focus states, animations)
 *     stay in `packages/frontend/src/index.css`.
 */

// ─── Color Palette ────────────────────────────────────────────────────────────
// Raw hex values — used when you need a color in a JS context (icon tints,
// chart colors, StyleSheet values in React Native).

export const colors = {
  // Brand — Grafito (warm near-black)
  brand:        '#1C1917',
  brandHover:   '#2A2724',
  brandLight:   '#F5F4F0',

  // Accent — Sol (warm amber)
  accent:       '#F5C842',
  accentHover:  '#E8B82A',
  accentSoft:   '#FBEFC1',
  accentFaint:  '#FDF7E1',

  // Stone scale (warm neutrals)
  stone50:      '#FAFAF8',
  stone100:     '#F7F6F3',
  stone150:     '#F5F4F0',
  stone200:     '#ECEAE7',
  stone300:     '#E5E4E0',
  stone400:     '#D6D3CD',
  stone500:     '#A8A29E',
  stone600:     '#78716C',
  stone700:     '#57534E',
  stone800:     '#3D3935',
  stone900:     '#1C1917',

  // Extended palette (chart bars, tags, accent KPIs)
  sol:          '#F5C842',
  olive:        '#8A8B3A',
  sage:         '#5C8A6E',
  sky:          '#5E81A8',
  plum:         '#8A5E89',
  clay:         '#B66B4A',

  // Sidebar / tab bar — dark grafito (Chromatic v2)
  sidebar:        '#1C1917',
  sidebarAccent:  '#2A2724',
  sidebarText:    '#FFFFFF',
  sidebarHover:   'rgba(255,255,255,0.06)',

  // Warm neutral surfaces
  secondary:      '#F5F4F0',
  secondaryLight: '#F7F6F3',

  dark:           '#1C1917',
  surface:        '#FFFDF8',   // cream body background
  surfaceCard:    '#FFFFFF',
  surfaceSunken:  '#F7F6F3',
  surfaceHover:   '#FAFAF8',

  border:         '#E5E4E0',
  borderStrong:   '#D6D3CD',

  // Semantic status (foreground colors)
  success: '#16A34A',
  warning: '#D97706',
  danger:  '#DC2626',
  info:    '#2563EB',

  // Semantic status — backgrounds + borders + foreground tints
  // (kit `.alert-*` / `.st-*` tokens — never inline these literals at a callsite)
  successBg:     '#F0FDF4',
  successBorder: 'rgba(22,163,74,0.18)',
  successText:   '#15803D',
  warningBg:     '#FFFBEB',
  warningBorder: 'rgba(217,119,6,0.18)',
  warningText:   '#92400E',
  dangerBg:      '#FFF1F2',
  dangerBorder:  'rgba(220,38,38,0.18)',
  dangerText:    '#BE123C',
  infoBg:        '#EFF6FF',
  infoBorder:    'rgba(37,99,235,0.18)',
  infoText:      '#1D4ED8',

  // ── Foreground opacities (Chromatic v2 — grafito on cream) ────────────────
  // Use these instead of inlining `rgba(28,25,23,*)` literals at callsites.
  fgPrimary:       '#1C1917',
  fgSecondary:     'rgba(28,25,23,0.55)',
  fgTertiary:      'rgba(28,25,23,0.45)',
  fgQuaternary:    'rgba(28,25,23,0.30)',
  fgDisabled:      'rgba(28,25,23,0.20)',
  fgOnBrand:       '#FFFFFF',
  fgOnAccent:      '#1C1917',

  // Foreground opacities on the dark sidebar / grafito surfaces.
  fgOnSidebar:           '#FFFFFF',
  fgOnSidebarSecondary:  'rgba(255,255,255,0.65)',
  fgOnSidebarTertiary:   'rgba(255,255,255,0.45)',
  fgOnSidebarFaint:      'rgba(255,255,255,0.20)',

  // Surface overlays (e.g. hover / pressed tints, sheet handles, backdrops).
  overlayFaint:    'rgba(28,25,23,0.04)',
  overlayLight:    'rgba(28,25,23,0.06)',
  overlayMedium:   'rgba(28,25,23,0.18)',
  overlayStrong:   'rgba(28,25,23,0.50)',
  // On the dark sidebar surface (kit `.sb-item:hover`, sheet on grafito, etc.)
  overlaySidebar:        'rgba(255,255,255,0.10)',
  overlaySidebarFaint:   'rgba(255,255,255,0.06)',
} as const;

export const fonts = {
  family:   'Manrope',
  regular:  'Manrope-Regular',
  medium:   'Manrope-Medium',
  semiBold: 'Manrope-SemiBold',
  bold:     'Manrope-Bold',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   'rounded-[6px]',
  base: 'rounded-[6px]',
  card: 'rounded-[14px]',
  full: 'rounded-full',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────
// Aligned with the web kit (`ds-*` utilities). No uppercase, no wide tracking —
// kit-style sentence case with tight letter-spacing on headings.

export const text = {
  heading:    'text-2xl font-space-bold text-dark tracking-tight',
  subheading: 'text-base font-space-semibold text-dark',
  body:       'text-sm font-space-medium text-dark/80',
  label:      'text-[11px] font-space-semibold text-dark/55',
  caption:    'text-[12px] font-space-medium text-dark/55',
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
  input:   'px-3 py-2.5',
} as const;

// ─── Borders ──────────────────────────────────────────────────────────────────

export const borders = {
  base:  'border border-stone-300',
  thick: 'border border-stone-400',
  thin:  'border border-stone-200',
  none:  'border-0',
} as const;

// ─── Shadows (soft, kit-aligned) ──────────────────────────────────────────────
// Raw CSS box-shadow values consumed by mobile's tailwind.config.
// Web uses CSS variables in index.css instead.

export const shadows = {
  hard:   '0px 1px 3px rgba(28,25,23,0.06)',
  hardSm: '0px 1px 2px rgba(28,25,23,0.04)',
  micro:  '0px 1px 1px rgba(28,25,23,0.03)',
} as const;

// ─── Status Colors ────────────────────────────────────────────────────────────
// Two palettes:
//
// 1. `statusColors`: pill/alert backgrounds + darker text (use when the status
//    sits inside a coloured chip/banner — kit `.badge` / `.alert-*` legacy).
//
// 2. `statusInlineColors`: brighter foreground used for the inline pattern
//    where the status renders next to a glyph without a background (kit
//    `.status .st-*` from `packages/frontend/src/index.css`).
//
// Web `StatusBadge` consumes `.st-*` directly via CSS. Mobile's
// `<StatusBadge>` reads from `statusInlineColors` to keep parity.

export const statusColors = {
  DRAFT:     { bg: '#F5F4F0', text: '#78716C', dot: '#A8A29E' },
  CREATED:   { bg: '#EFF6FF', text: '#1D4ED8', dot: '#60A5FA' },
  PENDING:   { bg: '#FFFBEB', text: '#92400E', dot: '#FBBF24' },
  SUBMITTED: { bg: '#FFF7ED', text: '#9A3412', dot: '#FB923C' },
  APPROVED:  { bg: '#F0FDF4', text: '#15803D', dot: '#4ADE80' },
  PAID:      { bg: '#ECFDF5', text: '#047857', dot: '#34D399' },
  REJECTED:  { bg: '#FFF1F2', text: '#BE123C', dot: '#FB7185' },
  DECLINED:  { bg: '#FFF1F2', text: '#BE123C', dot: '#FB7185' },
} as const;

/** Inline `.st-*` foreground colours from `packages/frontend/src/index.css`. */
export const statusInlineColors = {
  DRAFT:     '#78716C',
  CREATED:   '#1D4ED8',
  PENDING:   '#D97706',
  SUBMITTED: '#D97706',
  APPROVED:  '#16A34A',
  PAID:      '#047857',
  REJECTED:  '#DC2626',
  DECLINED:  '#DC2626',
} as const;

// ─── Role Colors ──────────────────────────────────────────────────────────────
// Reuse the warm Chromatic v2 accent palette for role chips.

export const roleColors = {
  EMPLOYEE:   { bg: '#57534E', text: '#FFFFFF' },
  MANAGER:    { bg: '#5E81A8', text: '#FFFFFF' },
  CONTROLLER: { bg: '#5C8A6E', text: '#FFFFFF' },
  ADMIN:      { bg: '#B66B4A', text: '#FFFFFF' },
  SUPERADMIN: { bg: '#8A5E89', text: '#FFFFFF' },
} as const;

// ─── Design System Numeric Tokens ─────────────────────────────────────────────
// Raw numeric values for component props (borderRadius in StyleSheet).

export const nbTokens = {
  radiusCard:  14,
  radiusBadge: 6,
  shadowCard:  0,
  shadowBadge: 0,
  shadowMicro: 0,
} as const;
