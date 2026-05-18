import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { MetaDivider } from "./PageHeader";

// ─── Container ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  children: ReactNode;
  /** Render slot pinned to the right (typically the clear-all link). */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Horizontal filter row. Wrap with `<FilterDivider />` between filter triggers
 * to mirror the meta-row visual grammar of `PageHeader`.
 *
 * Layout: `<FilterSearch />` on the left grows to fill space, triggers chained
 * with dividers, optional `trailing` slot anchored right.
 */
export const FilterBar = ({ children, trailing, className = "" }: FilterBarProps) => (
  <div className={`flex items-center gap-3 flex-wrap ${className}`.trim()}>
    {children}
    {trailing && <div className="ml-auto flex items-center">{trailing}</div>}
  </div>
);

// ─── Divider (hairline, vertical) ────────────────────────────────────────────

export const FilterDivider = MetaDivider;

// ─── Search input variant ────────────────────────────────────────────────────

interface FilterSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Search input shaped like the rest of the filter bar (10px radius, sunken
 * background). Replaces the legacy `.input-search` pill style for use inside
 * `<FilterBar>`.
 */
export const FilterSearch = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
}: FilterSearchProps) => {
  const inputId = useId();
  return (
    <div className={`relative flex-1 min-w-[200px] max-w-[420px] ${className}`.trim()}>
      <Search
        className="w-3.5 h-3.5 text-dark/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden={true}
      />
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-[10px] border border-[var(--color-border-main)] bg-surface-sunken text-[14px] font-sans-medium text-dark placeholder:text-dark/40 focus:outline-none focus:border-dark/30 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-dark/35 hover:text-dark/70 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3 h-3" aria-hidden={true} />
        </button>
      )}
    </div>
  );
};

// ─── Trigger button (icon + label + value + chevron) ────────────────────────

interface FilterTriggerProps {
  icon: ReactNode;
  label: string;
  /** Selected value displayed in bold dark. Falsy → placeholder is shown muted. */
  value?: ReactNode;
  placeholder?: string;
  /** Whether the filter currently has a value applied. Drives styling + clear. */
  active?: boolean;
  /** Whether the related popover is currently open. */
  open?: boolean;
  onClick: () => void;
  /** When provided AND `active`, an inline ✕ button is rendered to clear. */
  onClear?: () => void;
  /** Accessible label for the trigger button (defaults to label). */
  ariaLabel?: string;
  /** ARIA id of the popover panel — wires up aria-controls/expanded. */
  popoverId?: string;
}

/**
 * Inline filter trigger styled as `icon + small label + bold value + chevron`,
 * with `10px` hover background. Mirrors the meta-row pattern from `PageHeader`,
 * so a filter row reads as the same visual grammar as the detail meta-row.
 */
export const FilterTrigger = forwardRef<HTMLButtonElement, FilterTriggerProps>(
  function FilterTrigger(
    {
      icon,
      label,
      value,
      placeholder,
      active = false,
      open = false,
      onClick,
      onClear,
      ariaLabel,
      popoverId,
    },
    ref,
  ) {
    const hasValue = active && value !== undefined && value !== null && value !== "";
    const showClear = active && !!onClear;
    return (
      <div className="inline-flex items-center gap-0.5 leading-none">
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={popoverId}
          aria-label={ariaLabel ?? label}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] leading-none transition-colors duration-150 ${
            open || hasValue ? "bg-dark/[0.04]" : "hover:bg-dark/[0.03]"
          }`}
        >
          <span
            className={`shrink-0 ${hasValue ? "text-dark/65" : "text-dark/45"}`}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="text-[12px] font-sans-medium text-dark/45">{label}</span>
          <span
            className={
              hasValue
                ? "text-[15px] font-sans-semibold text-dark/85 tabular-nums"
                : "text-[14px] font-sans-medium text-dark/40"
            }
          >
            {hasValue ? value : placeholder}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-dark/35 shrink-0 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-md text-dark/30 hover:text-dark/70 hover:bg-dark/5 transition-colors"
            aria-label={`Clear ${label}`}
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);

// ─── Popover (positioned panel anchored to a trigger) ───────────────────────

interface FilterPopoverProps {
  /**
   * Render-prop for the trigger. Receives helpers; must spread `triggerProps`
   * onto a button (preferably `<FilterTrigger />`).
   */
  trigger: (helpers: {
    open: boolean;
    toggle: () => void;
    close: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    popoverId: string;
  }) => ReactNode;
  /** Panel content — `close` lets the body dismiss after a selection. */
  children: (helpers: { close: () => void }) => ReactNode;
  /** Tailwind classes applied to the panel wrapper (controls width, padding). */
  panelClassName?: string;
  /** Horizontal alignment of the panel relative to the trigger. */
  align?: "left" | "right";
}

/**
 * Generic anchored popover. Owns: outside-click dismiss, escape-to-close,
 * portal mount, viewport-relative positioning. Visual & dismiss-on-select
 * behaviour are delegated to the `children` render-prop.
 */
export const FilterPopover = ({
  trigger,
  children,
  panelClassName = "",
  align = "left",
}: FilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const [style, setStyle] = useState<React.CSSProperties>({});

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: align === "left" ? rect.left : undefined,
      right: align === "right" ? window.innerWidth - rect.right : undefined,
      zIndex: 9999,
    });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    reposition();
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  return (
    <>
      {trigger({ open, toggle, close, triggerRef, popoverId })}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={popoverId}
            style={style}
            className={`bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg shadow-[0px_8px_24px_rgba(28,25,23,0.08)] animate-in fade-in zoom-in-95 duration-100 origin-top ${panelClassName}`.trim()}
          >
            {children({ close })}
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── Clear-all button (right-aligned text link) ─────────────────────────────

interface FilterClearAllProps {
  onClick: () => void;
  children: ReactNode;
  /** Accessible label. Defaults to "Clear filters" so existing a11y queries keep working. */
  ariaLabel?: string;
}

export const FilterClearAll = ({
  onClick,
  children,
  ariaLabel = "Clear filters",
}: FilterClearAllProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="text-[12px] font-sans-medium text-dark/45 hover:text-dark transition-colors whitespace-nowrap"
  >
    {children}
  </button>
);
