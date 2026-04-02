/**
 * Web Design Tokens — Neobrutalista system.
 *
 * Exact visual match to the mobile PixelCard system:
 *   - BORDER_WIDTH = 2px  → border-2 border-dark
 *   - RADIUS = 8px        → rounded-lg
 *   - SHADOW default = 3px → shadow-hard  (same as mobile PixelCard shadowOffset=3)
 *   - SHADOW hero = 6px   → shadow-hard-lg (HeroReportCard shadowOffset=6)
 *   - SHADOW badge = 2px  → shadow-hard-sm
 *
 * Usage:
 *   import { tokens } from '@/styles/theme';
 *   <div className={tokens.card}>...</div>
 */

export { colors, radius, text, spacing, shadows, statusColors } from '@ticket-registrator/shared';

// ─── Transitions (web only) ───────────────────────────────────────────────────

export const transition = {
  base: 'transition-all duration-100',
  slow: 'transition-all duration-200',
} as const;

// ─── Shadows (web Tailwind utility names) ─────────────────────────────────────

export const shadow = {
  hard:   'shadow-hard',     // 3px — regular cards (matches mobile shadowOffset=3)
  hardSm: 'shadow-hard-sm',  // 2px — badges, inputs
  hardLg: 'shadow-hard-lg',  // 6px — hero card (matches mobile shadowOffset=6)
} as const;

// ─── Composite Component Tokens ───────────────────────────────────────────────

export const tokens = {

  // ── Card — exact match to PixelCard (BORDER_WIDTH=2, RADIUS=8) ───────────
  // shadow-hard = 3px offset (matches PendingReportCard/HistoryRow shadowOffset=3)
  // ── Card — exact match to PixelCard (BORDER_WIDTH=2, RADIUS=8) ───────────
  // shadow-hard = 3px offset (matches PendingReportCard/HistoryRow shadowOffset=3)
  card:    'bg-white border-2 border-border-main rounded-lg shadow-hard',
  cardPad: 'bg-white border-2 border-border-main rounded-lg p-4 shadow-hard',
  // Hero card: shadow-hard-lg = 6px offset (matches HeroReportCard shadowOffset=6)
  cardHero: 'bg-white border-2 border-border-main rounded-lg shadow-hard-lg',
  // Interactive card with press animation
  cardInteractive: 'neo-press cursor-pointer',
  // Static variant (no shadow, used for active/selected state)
  cardFlat: 'bg-white border-2 border-border-main rounded-lg p-4',

  // ── Input ─────────────────────────────────────────────────────────────────
  input: [
    'w-full px-4 py-3 rounded-lg border-2 border-border-main bg-white',
    'text-dark text-sm font-space-semibold',
    'placeholder:text-dark/40 placeholder:font-space',
    'shadow-hard-sm',
    'transition-all duration-100',
    'focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]',
    'disabled:opacity-60 disabled:bg-surface disabled:cursor-not-allowed',
  ].join(' '),
  inputError:    'border-danger',
  inputLabel:    'block text-[10px] font-space-bold text-dark/50 uppercase tracking-widest mb-2',
  inputHint:     'text-[10px] font-space text-dark/40 mt-1',
  inputErrorMsg: 'text-xs text-danger font-space-bold mt-1',

  // ── Button ─────────────────────────────────────────────────────────────────
  // Buttons use rounded-full (matches mt.btnPrimary)
  buttonBase: [
    'relative inline-flex items-center justify-center px-5 py-2.5',
    'rounded-full border-2 border-border-main',
    'font-space-bold text-sm',
    'neo-press',
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ].join(' '),
  buttonPrimary:    'bg-brand text-white shadow-hard',
  buttonSecondary:  'bg-white text-dark shadow-hard',
  buttonDanger:     'bg-danger text-white shadow-hard',
  buttonOutline:    'bg-transparent border-2 border-brand text-brand shadow-hard-sm hover:bg-brand/5',
  buttonGhost:      'bg-transparent border-2 border-border-main/20 text-dark shadow-none hover:border-border-main/50',
  buttonGhostWhite: 'bg-white/10 text-white border-2 border-white/40 shadow-none hover:bg-white/20',

  // ── Select ────────────────────────────────────────────────────────────────
  selectTrigger: [
    'w-full flex items-center justify-between px-4 py-3 rounded-lg',
    'border-2 border-border-main bg-white text-sm font-space-semibold text-left',
    'shadow-hard-sm neo-press',
    'disabled:opacity-60 disabled:bg-surface disabled:cursor-not-allowed',
  ].join(' '),
  selectTriggerFocus: 'shadow-none translate-x-[2px] translate-y-[2px]',
  selectDropdown:     'bg-white border-2 border-border-main rounded-lg shadow-hard-lg py-2 max-h-60 overflow-y-auto',
  selectOption:       'w-full flex items-center justify-between px-4 py-3 text-sm font-space-semibold text-left',
  selectOptionActive: 'bg-brand/10 text-brand font-space-bold',
  selectOptionIdle:   'text-dark hover:bg-surface',

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay:   'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6',
  modalBackdrop:  'absolute inset-0 bg-dark/50 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-none outline-none',
  modalContainer: 'relative bg-white w-full rounded-t-[40px] sm:rounded-lg border-2 border-border-main shadow-hard-lg animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-hidden',
  modalHeader:    'bg-white border-b-4 border-border-main px-6 pt-6 pb-5',
  modalTitle:     'text-xl font-space-bold text-dark tracking-tight',
  modalSubtitle:  'text-sm font-space text-dark/50 mt-0.5',
  modalBody:      'p-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar',
  modalClose:     'p-2 text-dark/40 hover:text-dark border-2 border-border-main/20 hover:border-border-main rounded-lg transition-colors duration-100 shrink-0 neo-press-sm shadow-hard-sm',

  // ── Badge / Status ─────────────────────────────────────────────────────────
  // Matches mobile StatusBadge: solid bg, 2px border, rounded-lg (radius=8), 3px shadow
  badge:        'inline-flex items-center gap-1.5 font-space-bold border-2 border-border-main rounded-lg px-2.5 py-1 text-[9px] shadow-hard-sm',
  badgeSm:      'inline-flex items-center gap-1 font-space-bold border-2 border-border-main rounded-lg px-2 py-0.5 text-[9px] shadow-hard-sm',
  badgeSuccess: 'bg-success text-white',
  badgeWarning: 'bg-warning text-white',
  badgeDanger:  'bg-danger text-white',
  badgeInfo:    'bg-brand text-white',
  badgeNeutral: 'bg-dark text-white',
  badgeBrand:   'bg-brand text-white',
  // Coral for CREATED status
  badgeCreated: 'bg-[#FF7F50] text-white',

  // ── Alert ─────────────────────────────────────────────────────────────────
  alert:        'flex items-start gap-3 px-4 py-3 border-2 border-border-main rounded-lg animate-in slide-in-from-top-2 fade-in duration-200 shadow-hard-sm',
  alertError:   'bg-danger/10 border-danger text-danger',
  alertSuccess: 'bg-success/10 border-success text-success',
  alertWarning: 'bg-warning/10 border-warning text-dark',
  alertInfo:    'bg-brand/10 border-brand text-brand',

  // ── PageHeader ─────────────────────────────────────────────────────────────
  // White bg + 4px bottom border (matches mobile header style)
  pageHeader:         'bg-white border-b-4 border-border-main px-6 py-4',
  pageHeaderTitle:    'text-2xl font-space-bold text-dark tracking-tight',
  pageHeaderSubtitle: 'text-dark/50 text-xs font-space-medium mt-0.5',

  // ── StatCard ───────────────────────────────────────────────────────────────
  statCard:        'bg-white border-2 border-border-main rounded-lg p-4 shadow-hard flex flex-col gap-2',
  statCardPrimary: 'bg-brand border-2 border-border-main rounded-lg p-4 shadow-hard-lg flex flex-col gap-2',
  statCardLabel:   'text-[10px] font-space-bold text-dark/50 uppercase tracking-widest',
  statCardValue:   'text-3xl font-space-bold text-dark leading-none tracking-tight',

  // ── List ──────────────────────────────────────────────────────────────────
  listItem:          'bg-white border-2 border-border-main rounded-lg p-4 shadow-hard neo-press cursor-pointer',
  listSection:       'bg-white border-2 border-border-main rounded-lg overflow-hidden shadow-hard',
  listSectionHeader: 'px-5 py-3.5 border-b-2 border-border-main flex items-center gap-2',
  listSectionTitle:  'text-xs font-space-bold text-dark',

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState:     'border-2 border-border-main border-dashed rounded-lg bg-white p-12 flex flex-col items-center justify-center text-center shadow-hard-sm',
  emptyStateIcon: 'w-14 h-14 bg-brand border-2 border-border-main rounded-lg flex items-center justify-center mb-4 shadow-hard',
  emptyStateText: 'text-sm font-space text-dark/50 max-w-xs leading-relaxed',

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeleton:     'bg-dark/10 animate-pulse rounded-lg',
  skeletonCard: 'bg-white border-2 border-border-main/20 rounded-lg p-4 animate-pulse',

  // ── Chip / Filter pill ─────────────────────────────────────────────────────
  // Matches filter pills: equal width, PixelCard with radius=6, shadowOffset=3
  chip:         'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border-2 border-border-main text-xs font-space-bold neo-press shadow-hard',
  chipActive:   'bg-brand text-white',
  chipInactive: 'bg-white text-dark',

  // ── Search bar ─────────────────────────────────────────────────────────────
  // Matches mobile searchRow: plain row, search icon + input + clear, white bg
  searchInput: [
    'flex-1 bg-transparent text-sm font-space-semibold text-dark',
    'placeholder:text-dark/40 placeholder:font-space',
    'focus:outline-none',
  ].join(' '),

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  sidebarNavItem:   'flex items-center rounded-lg transition-all duration-100 group relative',
  sidebarNavActive: 'bg-brand text-white border-2 border-border-main shadow-hard',
  sidebarNavIdle:   'text-dark/40 hover:text-dark hover:bg-white/20',

  // ── Pagination ────────────────────────────────────────────────────────────
  paginationBtn:        'flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-border-main text-xs font-space-bold text-dark disabled:opacity-40 disabled:cursor-not-allowed neo-press-sm shadow-hard-sm',
  paginationPage:       'w-8 h-8 rounded-lg border-2 border-border-main text-xs font-space-bold neo-press-sm',
  paginationPageActive: 'bg-brand text-white shadow-hard-sm',
  paginationPageIdle:   'bg-white text-dark shadow-hard-sm',

} as const;

export default tokens;
