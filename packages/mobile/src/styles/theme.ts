/**
 * Mobile Theme — NativeWind v2 className bundles aligned with the web kit
 * (`packages/frontend/src/index.css`, Chromatic v2).
 *
 * Platform-agnostic primitives come from shared. This file adds mobile-specific
 * composite tokens. Import `mt` for className strings, `colors` for JS values
 * (icon tints, RefreshControl, ActivityIndicator, etc.).
 *
 * Usage:
 *   import { mt, colors } from '../../src/styles/theme';
 *   <View className={mt.card}>...</View>
 *   <IconCamera color={colors.brand} />
 */

export { colors, radius, text, spacing, borders } from '@ticket-registrator/shared';

// ─── Mobile Composite Tokens — kit-aligned ───────────────────────────────────

export const mt = {
  // ── Screen
  screen:       'flex-1 bg-surface',
  screenPadded: 'flex-1 bg-surface px-6',

  // ── Card (kit: white surface, subtle stone-300 border, radius 14, soft shadow)
  card:    'bg-white border border-stone-300 rounded-card',
  cardPad: 'bg-white border border-stone-300 rounded-card p-6',

  // ── Branded hero card (active report, prominent CTA — grafito surface)
  heroCard: 'bg-brand border border-brand rounded-card p-6 relative overflow-hidden',

  // ── Stat tile (kit `.stat` — radius 14, subtle border)
  statCard:        'bg-white border border-stone-300 rounded-card px-5 py-4',
  statCardPrimary: 'bg-brand border border-brand rounded-card px-5 py-4',
  // Saturated KPI tones (kit `.stat--tone-*`)
  statToneBrand:   'bg-brand border border-brand rounded-card px-5 py-4',
  statToneAccent:  'bg-accent border border-accent rounded-card px-5 py-4',
  statToneClay:    'bg-clay border border-clay rounded-card px-5 py-4',
  statToneSage:    'bg-sage border border-sage rounded-card px-5 py-4',

  statCardLabel:   'text-[11px] font-space-semibold text-stone-600',
  statCardValue:   'text-[28px] font-space-bold text-dark tracking-tight',

  // ── Compact empty state
  emptyStateSm: 'items-center p-8 bg-white border border-stone-300 rounded-card',

  // ── Page header (kit `.page-head`)
  pageHeader:      'px-6 pt-6 pb-5 bg-surface',
  pageHeaderTitle: 'text-[28px] font-space-bold text-dark tracking-tight',
  pageHeaderSubtitle: 'text-sm font-space-medium text-stone-600 mt-1',

  // ── Section (kit `.section-head` + `.section-title`)
  sectionTitle: 'text-[15px] font-space-bold text-dark tracking-tight',
  sectionLabel: 'text-[11px] font-space-semibold text-stone-500',

  // ── Avatar (sidebar style accent on grafito)
  avatarBtn:    'w-10 h-10 bg-accent items-center justify-center rounded-full',
  avatarInner:  'w-10 h-10 items-center justify-center rounded-full overflow-hidden',

  // ── Input (kit `.input`)
  input:      'bg-white border border-stone-300 px-3 py-2.5 text-dark font-space-medium rounded-kit',
  inputLabel: 'text-[11px] font-space-semibold text-stone-600 mb-1.5',

  // ── Button (kit `.btn` — pill 9999px, no hard shadow)
  btnPrimary:       'bg-brand py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnSecondary:     'bg-white border border-stone-300 py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnGhost:         'bg-transparent py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnOutline:       'bg-transparent border border-stone-300 py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnDanger:        'bg-danger py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnAccent:        'bg-accent py-3 px-5 items-center justify-center flex-row gap-2 rounded-pill',
  btnSm:            'py-2 px-3.5 text-[11px] rounded-pill',
  btnLg:            'py-3.5 px-6 text-sm rounded-pill',
  btnTextPrimary:   'text-white font-space-semibold text-[13px]',
  btnTextSecondary: 'text-dark font-space-semibold text-[13px]',
  btnTextGhost:     'text-stone-600 font-space-semibold text-[13px]',
  btnTextAccent:    'text-dark font-space-semibold text-[13px]',
  btnTextDanger:    'text-white font-space-semibold text-[13px]',

  // ── Icon button (kit `.icon-btn` — 6px radius square)
  iconBtn: 'w-9 h-9 items-center justify-center rounded-kit',

  // ── Chip (kit `.chip` — pill filter)
  chip:         'px-3 py-1.5 bg-white border border-stone-300 rounded-pill',
  chipActive:   'px-3 py-1.5 bg-brand border border-brand rounded-pill',
  chipText:     'text-[12px] font-space-medium text-stone-600',
  chipTextActive: 'text-[12px] font-space-medium text-white',

  // ── List row (kit `.list-row` ledger: no side borders, top border only)
  listRow:        'flex-row items-center justify-between px-4 py-3.5 border-t border-stone-300 bg-transparent',
  listRowLast:    'flex-row items-center justify-between px-4 py-3.5 border-t border-b border-stone-300 bg-transparent',
  listHead:       'flex-row items-center px-4 py-2.5 border-b-2 border-brand',
  listHeadLabel:  'text-[11px] font-space-semibold text-stone-600',
  listRowName:    'text-sm font-space-semibold text-dark',
  listRowMeta:    'text-[12px] font-space-medium text-stone-500',
  listRowAmount:  'text-[16px] font-space-bold text-dark',

  // ── Status (kit `.status` — icon + colored word, no pill)
  statusBase:   'flex-row items-center gap-1.5',
  statusText:   'text-[13px] font-space-medium',

  // ── Empty state
  emptyState:      'items-center py-16 bg-white border border-stone-300 rounded-card',
  emptyStateIcon:  'w-14 h-14 bg-stone-100 items-center justify-center mb-4 rounded-full',
  emptyStateTitle: 'text-base font-space-semibold text-dark mb-1.5',
  emptyStateText:  'text-[13px] text-stone-600 font-space-medium text-center px-8',

  // ── Search bar (kit `.input-search` — sunken background, no border)
  searchBar:   'flex-row items-center bg-stone-100 rounded-kit px-3 py-2.5 gap-2',
  searchInput: 'flex-1 text-dark text-sm font-space-medium',

  // ── Tab bar (kit sidebar — dark grafito + white text)
  tabBar:        'flex-row bg-sidebar border-t border-stone-800',
  tabBarItem:    'flex-1 items-center justify-center py-2.5',
  tabBarLabel:   'text-[10px] font-space-semibold text-white/65 mt-1',
  tabBarLabelActive: 'text-[10px] font-space-semibold text-white mt-1',

  // ── Section card (kit `.card` with section-head)
  sectionCard: 'bg-white border border-stone-300 rounded-card p-5',

  // ── Field (kit `.field`)
  field:       'gap-1.5',
  fieldLabel:  'text-[11px] font-space-semibold text-stone-600',
  fieldError:  'text-[11px] font-space-medium text-danger mt-1',

  // ── Divider
  divider: 'h-px bg-stone-300 my-4',
} as const;
