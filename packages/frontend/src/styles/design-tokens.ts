/**
 * Design Tokens — Single source of truth for the TicketReg design system.
 *
 * Usage:
 *   import { tokens } from '@/styles/design-tokens';
 *   <div className={tokens.card}>...</div>
 *   <div className={cn(tokens.card, tokens.cardHover)}>...</div>
 *
 * All values use Tailwind classes mapped to the custom @theme in index.css.
 */

// ─── Colors (reference — actual values live in index.css @theme) ─────────────
//
// brand:          #336b87   — Primary actions, active states, links
// brand-hover:    #28556b   — Primary hover
// brand-light:    #4a8cae   — Light brand accents
// secondary:      #90afc5   — Secondary text, subtle borders
// secondary-light:#e0e9ef   — Very light secondary backgrounds
// dark:           #2a3132   — Primary text, sidebar bg
// surface:        #f8fafc   — Page background
//
// Semantic (new):
// success:        #059669   — Approved, completed, positive
// warning:        #d97706   — Pending, attention
// danger:         #dc2626   — Errors, rejected, destructive
// info:           #0284c7   — Informational, in progress

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  /** 6px — small badges, tags */
  sm: 'rounded-md',
  /** 8px — inputs, buttons, selects, small cards */
  base: 'rounded-lg',
  /** 12px — cards, modals, dropdowns, larger containers */
  card: 'rounded-xl',
  /** 9999px — avatars, pills, full-round badges */
  full: 'rounded-full',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadow = {
  /** Very subtle — inputs at rest, dividers */
  sm: 'shadow-sm',
  /** Base — cards, containers */
  base: 'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
  /** Medium — hover cards, elevated dropdowns */
  md: 'shadow-md',
  /** Large — modals, popovers */
  lg: 'shadow-lg',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const text = {
  /** Page titles */
  heading: 'text-lg font-semibold text-dark tracking-tight',
  /** Card/section titles */
  subheading: 'text-base font-semibold text-dark',
  /** Body text */
  body: 'text-sm text-slate-600',
  /** Form labels */
  label: 'text-xs font-medium text-slate-500 uppercase tracking-wide',
  /** Captions, hints, placeholders */
  caption: 'text-xs text-slate-400',
  /** Large stat numbers */
  stat: 'text-2xl font-bold text-dark tracking-tight',
  /** Small stat numbers */
  statSm: 'text-xl font-bold text-dark tracking-tight',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  /** Card padding */
  card: 'p-5',
  /** Card padding horizontal only */
  cardX: 'px-5',
  /** Card padding vertical only */
  cardY: 'py-5',
  /** Section gap between cards/groups */
  section: 'gap-6',
  /** Form fields gap */
  form: 'gap-4',
  /** Input internal padding */
  input: 'px-3.5 py-2.5',
} as const;

// ─── Transitions ─────────────────────────────────────────────────────────────

export const transition = {
  base: 'transition-all duration-200',
  slow: 'transition-all duration-300',
} as const;

// ─── Component Tokens ────────────────────────────────────────────────────────

export const tokens = {
  // ── Card ──────────────────────────────────────────────────────────────────
  card: `bg-white ${radius.card} border border-slate-200 ${shadow.sm} ${spacing.card}`,
  cardHover: `hover:${shadow.md} hover:border-brand/20 ${transition.base}`,
  cardFlat: `bg-white ${radius.card} border border-slate-200 ${spacing.card}`,

  // ── Input ─────────────────────────────────────────────────────────────────
  input: [
    `w-full ${spacing.input} ${radius.base} border border-slate-200 bg-white text-dark text-sm font-medium`,
    'placeholder:text-slate-400 placeholder:font-normal',
    `${transition.base}`,
    'hover:border-slate-300',
    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10',
    'disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed',
  ].join(' '),
  inputError: 'border-danger/50 focus:border-danger focus:ring-danger/10 bg-danger/[0.02]',
  inputLabel: `${text.label} mb-1.5 block`,
  inputHint: `${text.caption} mt-1`,
  inputErrorMsg: 'text-xs text-danger font-medium mt-1',

  // ── Button ────────────────────────────────────────────────────────────────
  buttonBase: [
    `relative inline-flex items-center justify-center ${spacing.input} ${radius.base}`,
    'font-semibold text-sm',
    `${transition.base}`,
    'active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
  buttonPrimary: 'bg-brand hover:bg-brand-hover text-white shadow-sm',
  buttonSecondary: 'bg-white text-dark hover:bg-slate-50 border border-slate-200 shadow-sm',
  buttonDanger: 'bg-danger hover:bg-red-700 text-white shadow-sm',
  buttonOutline: 'bg-transparent border border-brand text-brand hover:bg-brand/5',
  buttonGhost: 'bg-transparent text-slate-500 hover:text-brand hover:bg-brand/5',
  buttonGhostWhite: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm',

  // ── Select ────────────────────────────────────────────────────────────────
  selectTrigger: [
    `w-full flex items-center justify-between ${spacing.input} ${radius.base}`,
    'border border-slate-200 bg-white text-sm font-medium text-left',
    `${transition.base}`,
    'hover:border-slate-300',
    'disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed',
  ].join(' '),
  selectTriggerFocus: 'border-brand ring-2 ring-brand/10',
  selectDropdown: `bg-white border border-slate-200 ${radius.base} ${shadow.lg} py-1 max-h-60 overflow-y-auto`,
  selectOption: `w-full flex items-center justify-between px-3.5 py-2 text-sm font-medium text-left ${transition.base}`,
  selectOptionActive: 'bg-brand/10 text-brand',
  selectOptionIdle: 'text-dark hover:bg-slate-50 hover:text-brand',

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6',
  modalBackdrop: 'absolute inset-0 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-none outline-none',
  modalContainer: `relative bg-white w-full rounded-t-xl sm:${radius.card} ${shadow.lg} animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-hidden`,
  modalHeader: 'bg-brand px-6 pt-6 pb-4 relative overflow-hidden',
  modalTitle: 'text-lg font-semibold text-white tracking-tight',
  modalSubtitle: 'text-sm text-white/60 font-medium mt-0.5',
  modalBody: 'p-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar',
  modalClose: `p-2 text-white/60 hover:text-white hover:bg-white/10 ${radius.base} ${transition.base} shrink-0`,

  // ── Badge / Status ────────────────────────────────────────────────────────
  badge: `inline-flex items-center gap-1.5 font-semibold border ${radius.full} px-2.5 py-1 text-xs`,
  badgeSm: `inline-flex items-center gap-1 font-semibold border ${radius.full} px-2 py-0.5 text-[10px]`,

  // Status-specific badge colors
  badgeSuccess: 'bg-success/10 text-success border-success/20',
  badgeWarning: 'bg-warning/10 text-warning border-warning/20',
  badgeDanger: 'bg-danger/10 text-danger border-danger/20',
  badgeInfo: 'bg-info/10 text-info border-info/20',
  badgeNeutral: 'bg-slate-100 text-slate-600 border-slate-200',
  badgeBrand: 'bg-brand/10 text-brand border-brand/20',

  // ── Alert ─────────────────────────────────────────────────────────────────
  alert: `flex items-start gap-3 px-4 py-3 border ${radius.base} animate-in slide-in-from-top-2 fade-in duration-200`,
  alertError: 'bg-danger/5 border-danger/20 text-danger',
  alertSuccess: 'bg-success/5 border-success/20 text-success',
  alertWarning: 'bg-warning/5 border-warning/20 text-warning',
  alertInfo: 'bg-brand/5 border-brand/20 text-brand',

  // ── PageHeader ────────────────────────────────────────────────────────────
  pageHeader: `bg-brand ${radius.card} px-6 py-5 overflow-hidden ${shadow.sm} relative`,
  pageHeaderTitle: 'text-lg font-semibold text-white tracking-tight',
  pageHeaderSubtitle: 'text-white/50 text-xs font-medium mt-0.5',

  // ── StatCard ──────────────────────────────────────────────────────────────
  statCard: `bg-white ${radius.card} border border-slate-200 ${shadow.sm} ${spacing.card} flex flex-col gap-3`,
  statCardPrimary: `bg-brand ${radius.card} ${spacing.card} overflow-hidden shadow-md relative`,
  statCardLabel: 'text-xs font-medium text-slate-400 uppercase tracking-wide',
  statCardValue: 'text-2xl font-bold text-dark tracking-tight leading-none',

  // ── Table / List ──────────────────────────────────────────────────────────
  listItem: `bg-white ${radius.card} border border-slate-200 ${shadow.sm} p-4 flex items-center justify-between ${transition.base} hover:border-brand/20 hover:shadow-md cursor-pointer`,
  listSection: `bg-white ${radius.card} border border-slate-200 ${shadow.sm} overflow-hidden`,
  listSectionHeader: 'px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5',
  listSectionTitle: 'text-xs font-semibold text-slate-500 uppercase tracking-wide',

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: `${radius.card} border border-dashed border-slate-200 bg-slate-50/50 p-12 flex flex-col items-center justify-center text-center`,
  emptyStateIcon: `w-14 h-14 bg-white ${radius.card} ${shadow.sm} flex items-center justify-center mb-4 border border-slate-200`,
  emptyStateText: 'text-sm text-slate-400 font-medium max-w-xs leading-relaxed',

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeleton: 'bg-slate-100 animate-pulse',
  skeletonCard: `bg-white ${radius.card} border border-slate-200 p-5 animate-pulse`,

  // ── Filter / Chip ─────────────────────────────────────────────────────────
  chip: `px-3 py-1.5 ${radius.base} text-xs font-semibold ${transition.base}`,
  chipActive: 'bg-brand text-white shadow-sm',
  chipInactive: 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-brand/30 hover:text-brand',

  // ── Search input ──────────────────────────────────────────────────────────
  searchInput: [
    `w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 ${radius.base}`,
    'text-sm font-medium text-dark placeholder:text-slate-400',
    `focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand ${transition.base}`,
  ].join(' '),

  // ── Sidebar (kept dark) ───────────────────────────────────────────────────
  sidebarNavItem: `flex items-center ${radius.base} ${transition.base} group relative`,
  sidebarNavActive: 'bg-brand text-white shadow-md',
  sidebarNavIdle: 'text-gray-400 hover:bg-white/5 hover:text-white',

  // ── Pagination ────────────────────────────────────────────────────────────
  paginationBtn: `flex items-center gap-1 px-3 py-2 ${radius.base} border border-slate-200 text-xs font-semibold text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand/30 hover:text-brand hover:bg-brand/5 ${transition.base}`,
  paginationPage: `w-8 h-8 ${radius.base} text-xs font-semibold ${transition.base}`,
  paginationPageActive: 'bg-brand text-white shadow-sm',
  paginationPageIdle: 'border border-slate-200 text-slate-400 hover:border-brand/30 hover:text-brand hover:bg-brand/5',
} as const;

export default tokens;
