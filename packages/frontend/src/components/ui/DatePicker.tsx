import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Calendar } from "./Calendar";
import type { DateRange } from "./Calendar";
import { useDropdown } from "../../hooks/useDropdown";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";

interface DatePickerRenderTriggerArgs {
  open: boolean;
  /** Pre-formatted display string for the current value, or null if empty. */
  displayValue: string | null;
  toggle: () => void;
  clear: () => void;
  /** Callback ref — pass to the consumer's trigger button so the dropdown
   *  positioning can read its bounding rect. */
  attachTrigger: (node: HTMLButtonElement | null) => void;
}

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  mode?: "single" | "range";
  value?: Date | DateRange | null;
  onChange?: (date: Date | DateRange | null) => void;
  error?: string;
  disabled?: boolean;
  /** When provided, replaces the default `.select-trigger` styling on the
   *  trigger button (used by ReportFilterBar to render the trigger as a chip). */
  triggerClassName?: string;
  /** Render-prop that fully replaces the default trigger button (e.g. for
   *  rendering as a `<FilterTrigger />` inside a `<FilterBar />`). */
  renderTrigger?: (args: DatePickerRenderTriggerArgs) => React.ReactNode;
}

export const DatePicker = ({
  label,
  placeholder,
  mode = "single",
  value,
  onChange,
  error,
  disabled,
  triggerClassName,
  renderTrigger,
}: DatePickerProps) => {
  const { t } = useTranslation();
  const {
    open,
    setOpen,
    containerRef,
    triggerRef,
    dropdownStyle,
    handleKeyDown,
  } = useDropdown({ id: `datepicker-${label?.toLowerCase()}` });

  // The renderTrigger path tracks the consumer-rendered button via state
  // (and syncs into the internal `triggerRef` so useDropdown's positioning
  // calc works) instead of passing a ref through render — keeps us clear of
  // react-hooks/refs.
  const [triggerNode, setTriggerNode] = useState<HTMLButtonElement | null>(
    null,
  );
  useEffect(() => {
    (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current =
      triggerNode;
  }, [triggerNode, triggerRef]);

  const getDisplayValue = () => {
    if (!value) return null;
    if (mode === "single") {
      const dateValue = value instanceof Date ? value : null;
      if (dateValue && !Number.isNaN(dateValue.getTime())) {
        return format(dateValue, "d 'de' MMMM, yyyy", { locale: es });
      }
      return null;
    }
    const range = value as DateRange;
    if (!range.start) return null;
    if (!range.end) return format(range.start, "d 'de' MMMM", { locale: es });
    return `${format(range.start, "d MMM")} - ${format(range.end, "d MMM, yyyy")}`;
  };

  const displayValue = getDisplayValue();
  const errorId = error && label ? `datepicker-${label.toLowerCase()}-error` : undefined;

  const triggerClass = triggerClassName
    ? `${triggerClassName}${error ? " is-error" : ""}`
    : ["select-trigger", open ? "is-open" : "", error ? "is-error" : ""].filter(Boolean).join(" ");

  return (
    <div className="field" ref={containerRef}>
      {label && <label className="field-label">{label}</label>}

      <div className="relative">
        {renderTrigger ? (
          renderTrigger({
            open,
            displayValue,
            toggle: () => setOpen(!open),
            clear: () => onChange?.(null),
            attachTrigger: setTriggerNode,
          })
        ) : (
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={triggerClass}
          >
            <CalendarIcon className="w-4 h-4 text-dark/40 shrink-0" aria-hidden={true} />
            <span
              className={`flex-1 truncate text-[13px] ${
                !displayValue ? "text-dark/40 font-sans-normal" : "text-dark font-sans-medium"
              }`}
            >
              {displayValue ||
                placeholder ||
                (mode === "range" ? t("ui.selectDateRange") : t("ui.selectDate"))}
            </span>
            <div className="flex items-center gap-2">
              {displayValue && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(null);
                  }}
                  className="p-1 hover:bg-dark/5 rounded-md transition-colors"
                  aria-label={t("common.close")}
                >
                  <X className="w-3 h-3 text-dark/40" aria-hidden={true} />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-dark/40 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden={true}
              />
            </div>
          </button>
        )}

        {open && createPortal(
          <div
            style={dropdownStyle}
            data-listbox={`datepicker-${label?.toLowerCase()}`}
            className="z-[9999] animate-in fade-in zoom-in-95 duration-100 origin-top"
          >
            <Calendar
              mode={mode}
              value={value}
              onChange={(v) => {
                onChange?.(v);
                if (mode === "single" || (mode === "range" && (v as DateRange).end)) {
                  setOpen(false);
                }
              }}
              className="w-full max-w-[320px]"
            />
          </div>,
          document.body,
        )}
      </div>

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
};
