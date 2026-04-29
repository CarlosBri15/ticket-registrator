/**
 * Web Design Tokens — Minimalist system.
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

// ─── Composite Component Tokens ───────────────────────────────────────────────

export const tokens = {

  // ── Card — clean white surfaces ─────────────────────────────────────────
  card: 'bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg',

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
  modalContainer: 'relative bg-[var(--color-surface-card)] w-full rounded-t-2xl sm:rounded-2xl border border-[var(--color-border-main)] shadow-[0px_20px_48px_rgba(28,25,23,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-200 overflow-hidden',
  modalHeader:    'px-8 pt-8 pb-4',
  modalTitle:     'text-[24px] font-sans-bold text-dark tracking-tight leading-none',
  modalSubtitle:  'text-sm font-sans-normal text-dark/40 mt-2',
  modalClose:     'w-10 h-10 flex items-center justify-center text-dark/30 hover:text-dark hover:bg-dark/5 rounded-full transition-colors duration-200 shrink-0',
  modalBody:      'px-10 pb-10',

  // ── Alert ─────────────────────────────────────────────────────────────────
  alert:        'flex items-start gap-3 px-4 py-3 border rounded-lg animate-in slide-in-from-top-2 fade-in duration-200',
  alertError:   'bg-red-50 border-red-100 text-red-700',
  alertSuccess: 'bg-green-50 border-green-100 text-green-700',
  alertWarning: 'bg-amber-50 border-amber-100 text-amber-700',
  alertInfo:    'bg-blue-50 border-blue-100 text-blue-700',

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  sidebarNavItem:   'flex items-center rounded-md transition-all duration-100 group relative',
  sidebarNavActive: 'bg-white text-dark font-sans-semibold shadow-[0px_1px_3px_rgba(28,25,23,0.07)]',
  sidebarNavIdle:   'text-dark/55 font-sans-normal hover:text-dark hover:bg-dark/5',

} as const;

export default tokens;
