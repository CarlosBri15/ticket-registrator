import { createPortal } from "react-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface BaseSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  id: string;
  displayValue: string | null;
  placeholder?: string;
  emptyI18nKey: "ui.selectOption" | "ui.selectOptions";
  open: boolean;
  onToggle: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  dropdownStyle: React.CSSProperties;
  nativeSelect: React.ReactNode;
  triggerTestId: string;
  dropdownTestId: string;
  children: React.ReactNode;
}

/**
 * Headless-style select shell built on top of the kit `.field +
 * .select-trigger + .select-dropdown` primitives. Accessibility (native
 * `<select>` mirror + keyboard navigation) is delegated to the caller via
 * `nativeSelect` and `handleKeyDown` props.
 */
export const BaseSelect = ({
  label,
  required,
  error,
  disabled = false,
  isLoading = false,
  id,
  displayValue,
  placeholder,
  emptyI18nKey,
  open,
  onToggle,
  triggerRef,
  containerRef,
  handleKeyDown,
  dropdownStyle,
  nativeSelect,
  triggerTestId,
  dropdownTestId,
  children,
}: BaseSelectProps) => {
  const { t } = useTranslation();
  const isPlaceholder = displayValue === null;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="field" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {nativeSelect}

        <button
          ref={triggerRef}
          data-testid={triggerTestId}
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled || isLoading}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={[
            "select-trigger",
            open ? "is-open" : "",
            error ? "is-error" : "",
          ].filter(Boolean).join(" ")}
        >
          <span className={isPlaceholder ? "text-dark/40 font-sans-normal" : "text-dark"}>
            {isLoading
              ? t("ui.loading")
              : (displayValue ?? placeholder ?? t(emptyI18nKey))}
          </span>
          <span className="shrink-0 ml-2 text-dark/40">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden={true} />
            ) : (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                aria-hidden={true}
              />
            )}
          </span>
        </button>

        {open && createPortal(
          <div
            id={`${id}-listbox`}
            data-testid={dropdownTestId}
            aria-hidden="true"
            data-listbox={id}
            style={dropdownStyle}
            className="select-dropdown"
          >
            {children}
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
