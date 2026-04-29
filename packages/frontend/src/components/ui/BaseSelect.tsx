import { createPortal } from 'react-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../styles/theme';

export interface BaseSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  id: string;
  displayValue: string | null;
  placeholder?: string;
  emptyI18nKey: 'ui.selectOption' | 'ui.selectOptions';
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

  const triggerClasses = [
    tokens.selectTrigger,
    open ? tokens.selectTriggerFocus : '',
    error ? tokens.inputError : '',
  ].join(' ');

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className={tokens.inputLabel}>
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
          className={triggerClasses}
        >
          <span className={isPlaceholder ? 'text-slate-400 font-normal' : 'text-dark'}>
            {isLoading
              ? t('ui.loading')
              : (displayValue ?? placeholder ?? t(emptyI18nKey))}
          </span>
          <span className="shrink-0 ml-2 text-slate-400">
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden={true} />
              : <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden={true} />
            }
          </span>
        </button>

        {open && createPortal(
          <div
            id={`${id}-listbox`}
            data-testid={dropdownTestId}
            aria-hidden="true"
            data-listbox={id}
            style={dropdownStyle}
            className={tokens.selectDropdown}
          >
            {children}
          </div>,
          document.body,
        )}
      </div>

      {error && <p className={tokens.inputErrorMsg}>{error}</p>}
    </div>
  );
};
