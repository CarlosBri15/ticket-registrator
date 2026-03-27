/**
 * Mobile Theme — NativeWind v2 compatible tokens.
 *
 * Platform-agnostic primitives come from shared. This file adds mobile-specific
 * composite tokens. Import `mt` for className strings, `colors` for JS values
 * (icon tints, RefreshControl, ActivityIndicator, etc.).
 *
 * Usage:
 *   import { mt, colors } from '../../src/styles/theme';
 *   <View className={mt.card}>...</View>
 *   <Feather color={colors.brand} />
 */

export { colors, radius, text, spacing } from '@ticket-registrator/shared';

// ─── Mobile Composite Tokens ─────────────────────────────────────────────────

export const mt = {
  // ── Screen
  screen:       'flex-1 bg-surface',
  screenPadded: 'flex-1 bg-surface px-6',

  // ── Card
  card:    'bg-white rounded-3xl border border-gray-100',
  cardPad: 'bg-white rounded-3xl border border-gray-100 p-5',

  // ── Branded hero card (active report, prominent CTA)
  heroCard: 'bg-brand rounded-3xl p-6 relative overflow-hidden',

  // ── Stat cards
  statCardDanger: 'bg-red-50 p-6 rounded-3xl border border-red-100',

  // ── Avatar / initials button
  avatarBtn:   'w-20 h-20 bg-white rounded-[24px] items-center justify-center shadow-md border border-gray-100',
  avatarInner: 'w-16 h-16 bg-secondary/10 rounded-2xl items-center justify-center',

  // ── Compact empty state (no huge padding)
  emptyStateSm: 'items-center p-8 bg-white rounded-3xl border border-dashed border-gray-200',

  // ── Page header
  pageHeader:      'px-6 py-4 bg-white border-b border-gray-50',
  pageHeaderTitle: 'text-2xl font-bold text-dark',

  // ── Section
  sectionTitle: 'text-lg font-bold text-dark',
  sectionLabel: 'text-xs font-bold text-gray-400 uppercase',

  // ── Stat card
  statCard:        'bg-white p-6 rounded-3xl border border-gray-100',
  statCardPrimary: 'bg-brand p-6 rounded-3xl',
  statCardLabel:   'text-sm font-medium text-gray-500',
  statCardValue:   'text-3xl font-bold mt-1',

  // ── Input
  input:      'bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-dark font-medium',
  inputLabel: 'text-xs font-bold text-gray-400 uppercase mb-2',

  // ── Button
  btnPrimary:       'bg-brand rounded-2xl py-3.5 px-5 items-center justify-center flex-row',
  btnSecondary:     'bg-white rounded-2xl py-3.5 px-5 items-center justify-center flex-row border border-gray-200',
  btnGhost:         'rounded-2xl py-3 px-5 items-center justify-center border border-gray-200',
  btnDanger:        'bg-red-500 rounded-2xl py-3.5 px-5 items-center justify-center flex-row',
  btnTextPrimary:   'text-white font-bold',
  btnTextSecondary: 'text-dark font-bold',
  btnTextGhost:     'text-gray-600 font-bold',

  // ── List item
  listItem:    'bg-white rounded-3xl border border-gray-100 p-4 flex-row items-center justify-between mb-3',
  listSection: 'bg-white rounded-3xl border border-gray-100 overflow-hidden',

  // ── Icon containers
  iconBox:      'w-16 h-16 rounded-2xl items-center justify-center',
  iconBoxSm:    'w-12 h-12 rounded-xl items-center justify-center',
  iconBoxRound: 'w-16 h-16 rounded-full items-center justify-center',

  // ── Empty state
  emptyState:      'items-center py-24 bg-white rounded-3xl border border-dashed border-gray-200',
  emptyStateIcon:  'w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6',
  emptyStateTitle: 'text-xl font-bold text-dark mb-2',
  emptyStateText:  'text-sm text-gray-400 text-center px-8',

  // ── Badge
  badgeBrand:   'bg-brand/10 px-3 py-1 rounded-full',
  badgeSuccess: 'bg-green-100 px-3 py-1 rounded-full flex-row items-center gap-1',
  badgeDanger:  'bg-red-100 px-3 py-1 rounded-full',

  // ── Search
  searchBar:   'flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 gap-3',
  searchInput: 'flex-1 text-dark text-sm',
} as const;
