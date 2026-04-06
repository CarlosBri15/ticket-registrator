/**
 * Web Design Tokens — Neobrutalista system.
 *
 * Exact visual match to the mobile PixelCard system:
 *   - BORDER_WIDTH = 2px  → border-2 border-dark
 *   - RADIUS = 8px        → rounded-xl
 *   - SHADOW default = 3px → shadow-hard  (same as mobile PixelCard shadowOffset=3)
 *   - SHADOW hero = 6px   → shadow-hard-lg (HeroReportCard shadowOffset=6)
 *   - SHADOW badge = 2px  → shadow-hard-sm
 *
 * Usage:
 *   import { tokens } from '@/styles/theme';
 *   <div className={tokens.card}>...</div>
 */

export { colors, radius, text, spacing, shadows, statusColors, nbTokens } from '@ticket-registrator/shared';


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

  // ── Card — clean white surfaces ─────────────────────────────────────────
  card:            'bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg',
  cardInteractive: 'hover:bg-[#FAFAF8] cursor-pointer transition-colors duration-100',
  cardFlat:        'bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg p-4',

  // ── Input ─────────────────────────────────────────────────────────────────
  input: [
    'w-full px-3 py-2 rounded-md border border-[var(--color-border-main)] bg-[var(--color-surface-card)]',
    'text-dark text-sm font-sans-medium',
    'placeholder:text-dark/35 placeholder:font-sans-normal',
    'transition-all duration-100',
    'focus:outline-none focus:border-dark/40 focus:ring-2 focus:ring-dark/8 focus:shadow-none',
    'disabled:opacity-50 disabled:bg-[var(--color-surface)] disabled:cursor-not-allowed',
  ].join(' '),
  inputError:    'border-danger focus:border-danger focus:ring-danger/10',
  inputLabel:    'block text-[11px] font-sans-semibold text-dark/50 mb-1.5 uppercase tracking-wide',
  inputHint:     'text-[11px] font-sans-normal text-dark/40 mt-1',
  inputErrorMsg: 'text-[11px] text-danger font-sans-medium mt-1',

  // ── Button ─────────────────────────────────────────────────────────────────
  buttonBase: [
    'relative inline-flex items-center justify-center px-3.5 py-2',
    'rounded-md',
    'font-sans-medium text-[13px]',
    'transition-all duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  buttonPrimary:     'bg-brand text-white hover:bg-brand-hover border border-brand/20',
  buttonSuccess:     'bg-success text-white hover:opacity-90',
  buttonSecondary:   'bg-white text-dark border border-[var(--color-border-main)] hover:bg-[#FAFAF8]',
  buttonDanger:      'bg-danger text-white hover:opacity-90',
  buttonOutline:     'bg-transparent border border-[var(--color-border-main)] text-dark hover:bg-[#FAFAF8]',
  buttonGhost:       'bg-transparent text-dark/50 hover:text-dark hover:bg-dark/5',
  buttonGhostWhite:  'bg-white/10 text-white hover:bg-white/20',
  buttonGhostDanger: 'bg-transparent text-danger hover:bg-danger/5',
  buttonGhostBrand:  'bg-transparent text-dark/60 hover:bg-dark/5',

  // ── Select ────────────────────────────────────────────────────────────────
  selectTrigger: [
    'w-full flex items-center justify-between px-3 py-2 rounded-md',
    'border border-[var(--color-border-main)] bg-[var(--color-surface-card)] text-sm font-sans-medium text-left',
    'transition-all duration-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  selectTriggerFocus: 'border-dark/40 ring-2 ring-dark/8',
  selectDropdown:     'bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-md py-1 max-h-60 overflow-y-auto shadow-[0px_8px_24px_rgba(28,25,23,0.08)]',
  selectOption:       'w-full flex items-center justify-between px-3 py-2 text-sm font-sans-medium text-left',
  selectOptionActive: 'bg-brand/10 text-dark font-sans-semibold',
  selectOptionIdle:   'text-dark hover:bg-[var(--color-surface)]',

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay:   'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6',
  modalBackdrop:  'absolute inset-0 bg-dark/30 backdrop-blur-[2px] animate-in fade-in duration-200 w-full h-full border-none outline-none',
  modalContainer: 'relative bg-[var(--color-surface-card)] w-full rounded-t-2xl sm:rounded-xl border border-[var(--color-border-main)] shadow-[0px_20px_60px_rgba(28,25,23,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-200 overflow-hidden',
  modalHeader:    'bg-[var(--color-surface-header)] border-b border-[var(--color-border-main)] px-6 pt-6 pb-5',
  modalTitle:     'text-[17px] font-sans-semibold text-dark tracking-tight',
  modalSubtitle:  'text-sm font-sans-normal text-dark/50 mt-0.5',
  modalClose:     'w-8 h-8 flex items-center justify-center text-dark/40 hover:text-dark hover:bg-dark/5 rounded-md transition-colors duration-100 shrink-0',

  // ── Badge / Status ─────────────────────────────────────────────────────────
  badge:        'inline-flex items-center gap-1.5 font-sans-medium rounded-md px-2 py-0.5 text-[11px]',
  badgeSm:      'inline-flex items-center gap-1 font-sans-medium rounded px-1.5 py-0.5 text-[10px]',
  badgeSuccess: 'bg-green-50 text-green-700',
  badgeWarning: 'bg-amber-50 text-amber-700',
  badgeDanger:  'bg-red-50 text-red-700',
  badgeInfo:    'bg-blue-50 text-blue-700',
  badgeNeutral: 'bg-[var(--color-secondary)] text-dark/60',
  badgeBrand:   'bg-brand/15 text-dark',
  badgeCreated: 'bg-blue-50 text-blue-700',

  // ── Alert ─────────────────────────────────────────────────────────────────
  alert:        'flex items-start gap-3 px-4 py-3 border rounded-lg animate-in slide-in-from-top-2 fade-in duration-200',
  alertError:   'bg-red-50 border-red-100 text-red-700',
  alertSuccess: 'bg-green-50 border-green-100 text-green-700',
  alertWarning: 'bg-amber-50 border-amber-100 text-amber-700',
  alertInfo:    'bg-blue-50 border-blue-100 text-blue-700',

  // ── PageHeader ─────────────────────────────────────────────────────────────
  headerPage:         'bg-[var(--color-surface-header)] px-8 md:px-12 h-[68px] flex items-center justify-between border-b border-[var(--color-border-main)]',
  pageHeader:         'bg-[var(--color-surface-header)] px-6 h-[68px] flex items-center justify-between border-b border-[var(--color-border-main)]',
  pageHeaderTitle:    'text-[20px] font-sans-semibold text-dark tracking-tight leading-none',
  pageHeaderSubtitle: 'text-dark/50 text-[13px] font-sans-normal mt-1',

  // ── StatCard ───────────────────────────────────────────────────────────────
  statCard:        'bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg flex flex-col gap-1.5 p-5',
  statCardPrimary: 'bg-brand/10 border border-brand/20 rounded-lg flex flex-col gap-1.5 p-5',
  statCardLabel:   'text-[11px] font-sans-medium text-dark/50 uppercase tracking-wide',
  statCardValue:   'text-[26px] font-sans-semibold text-dark leading-none tracking-tight',

  // ── List / Data Table ─────────────────────────────────────────────────────
  listItem:          'bg-[var(--color-surface-card)] hover:bg-[#FAFAF8] cursor-pointer border-b border-[var(--color-border-main)] last:border-b-0 transition-colors duration-100',
  listSection:       'bg-[var(--color-surface-card)] w-full overflow-hidden border border-[var(--color-border-main)] rounded-lg',
  listSectionHeader: 'px-5 py-2.5 border-b border-[var(--color-border-main)] flex items-center gap-2 bg-[var(--color-surface)]',
  listSectionTitle:  'text-[10px] font-sans-semibold text-dark/40 uppercase tracking-widest',

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState:     'border border-dashed border-[var(--color-border-main)] rounded-lg bg-[var(--color-surface-card)] p-12 flex flex-col items-center justify-center text-center',
  emptyStateIcon: 'w-11 h-11 bg-[var(--color-surface)] border border-[var(--color-border-main)] rounded-lg flex items-center justify-center mb-4',
  emptyStateText: 'text-[13px] font-sans-normal text-dark/50 max-w-sm leading-relaxed',

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeleton:     'bg-dark/6 animate-pulse rounded-md',
  skeletonCard: 'bg-[var(--color-surface-card)] border border-[var(--color-border-main)]/60 rounded-lg p-4 animate-pulse',

  // ── Chip / Filter pill ─────────────────────────────────────────────────────
  chip:         'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border-main)] text-[12px] font-sans-medium transition-colors duration-100',
  chipActive:   'bg-dark text-white border-dark',
  chipInactive: 'bg-[var(--color-surface-card)] text-dark/70 hover:bg-[var(--color-surface)]',

  // ── Search bar ─────────────────────────────────────────────────────────────
  searchInput: [
    'flex-1 bg-transparent text-[13px] font-sans-normal text-dark',
    'placeholder:text-dark/35',
    'focus:outline-none',
  ].join(' '),

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  sidebarNavItem:   'flex items-center rounded-md transition-all duration-100 group relative',
  sidebarNavActive: 'bg-white text-dark font-sans-semibold shadow-[0px_1px_3px_rgba(28,25,23,0.07)]',
  sidebarNavIdle:   'text-dark/55 font-sans-normal hover:text-dark hover:bg-dark/5',

  // ── Pagination ────────────────────────────────────────────────────────────
  paginationBtn:        'flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--color-border-main)] text-[12px] font-sans-medium text-dark disabled:opacity-35 disabled:cursor-not-allowed transition-colors hover:bg-[var(--color-surface)]',
  paginationPage:       'w-7 h-7 rounded-md border border-[var(--color-border-main)] text-[12px] font-sans-medium transition-colors',
  paginationPageActive: 'bg-dark text-white border-dark',
  paginationPageIdle:   'bg-[var(--color-surface-card)] text-dark hover:bg-[var(--color-surface)]',

} as const;

export default tokens;
