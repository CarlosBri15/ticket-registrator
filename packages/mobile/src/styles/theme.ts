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
 *   <IconCamera color={colors.brand} />
 */

export { colors, radius, text, spacing, borders } from '@ticket-registrator/shared';

// ─── Mobile Composite Tokens ─────────────────────────────────────────────────

export const mt = {
  // ── Screen
  screen:       'flex-1 bg-surface',
  screenPadded: 'flex-1 bg-surface px-6',

  // ── Card
  card:    'bg-white border-4 border-dark rounded-[24px] shadow-hard',
  cardPad: 'bg-white border-4 border-dark rounded-[24px] p-5 shadow-hard',

  // ── Branded hero card (active report, prominent CTA)
  heroCard: 'bg-brand border-4 border-dark rounded-[24px] p-6 relative overflow-hidden shadow-hard',

  // ── Stat cards
  statCardDanger: 'bg-red-50 p-6 border-4 border-dark rounded-[24px] shadow-hard',

  // ── Avatar / initials button
  avatarBtn:   'w-20 h-20 bg-white border-4 border-dark items-center justify-center rounded-[20px] shadow-hard',
  avatarInner: 'w-16 h-16 bg-secondary/10 items-center justify-center',

  // ── Compact empty state
  emptyStateSm: 'items-center p-8 bg-white border-4 border-dark rounded-[24px] shadow-hard',

  // ── Page header
  pageHeader:      'px-6 py-4 bg-surface border-b-4 border-dark',
  pageHeaderTitle: 'text-2xl font-black text-dark tracking-tighter uppercase',

  // ── Section
  sectionTitle: 'text-lg font-black text-dark uppercase',
  sectionLabel: 'text-[10px] font-black text-dark/40 uppercase',

  // ── Stat card
  statCard:        'bg-white p-6 border-4 border-dark rounded-[24px] shadow-hard',
  statCardPrimary: 'bg-brand p-6 border-4 border-dark rounded-[24px] shadow-hard',
  statCardLabel:   'text-xs font-black text-dark uppercase',
  statCardValue:   'text-3xl font-black mt-1 text-dark',

  // ── Input
  input:      'bg-white border-4 border-dark px-4 py-3 text-black font-black uppercase rounded-xl',
  inputLabel: 'text-[10px] font-black text-dark uppercase mb-2',

  // ── Button
  btnPrimary:       'bg-brand border-4 border-dark py-3.5 px-5 items-center justify-center flex-row rounded-full shadow-hard',
  btnSecondary:     'bg-white border-4 border-dark py-3.5 px-5 items-center justify-center flex-row rounded-full shadow-hard',
  btnGhost:         'bg-transparent border-4 border-dark py-3 px-5 items-center justify-center rounded-xl',
  btnDanger:        'bg-danger border-4 border-dark py-3.5 px-5 items-center justify-center flex-row rounded-full shadow-hard',
  btnTextPrimary:   'text-white font-black uppercase text-sm',
  btnTextSecondary: 'text-dark font-black uppercase text-sm',
  btnTextGhost:     'text-dark font-black uppercase text-sm',

  // ── List item
  listItem:    'bg-white border-4 border-dark p-4 flex-row items-center justify-between mb-4 rounded-[20px] shadow-hard',
  listSection: 'bg-white border-4 border-dark overflow-hidden rounded-[20px] shadow-hard',

  // ── Icon containers
  iconBox:      'w-16 h-16 items-center justify-center',
  iconBoxSm:    'w-12 h-12 items-center justify-center',
  iconBoxRound: 'w-16 h-16 items-center justify-center',

  // ── Empty state
  emptyState:      'items-center py-20 bg-white border-4 border-dark rounded-[24px] shadow-hard',
  emptyStateIcon:  'w-24 h-24 bg-brand border-4 border-dark items-center justify-center mb-6 shadow-hard',
  emptyStateTitle: 'text-xl font-black text-dark uppercase mb-2',
  emptyStateText:  'text-sm text-dark font-bold text-center px-8',

  // ── Badge
  badgeBrand:   'bg-brand border-4 border-dark px-5 py-2.5 rounded-full shadow-hard-sm',
  badgeSuccess: 'bg-success border-4 border-dark px-5 py-2.5 rounded-full flex-row items-center gap-1.5 shadow-hard-sm',
  badgeDanger:  'bg-danger border-4 border-dark px-5 py-2.5 rounded-full shadow-hard-sm',

  // ── Search
  searchBar:   'flex-row items-center bg-white border-4 border-dark rounded-xl px-4 py-3 gap-3 shadow-hard',
  searchInput: 'flex-1 text-dark text-sm font-black uppercase',
} as const;
