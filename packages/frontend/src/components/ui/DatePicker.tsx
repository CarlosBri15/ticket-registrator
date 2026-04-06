import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Calendar } from './Calendar';
import type { DateRange } from './Calendar';
import { useDropdown } from '../../hooks/useDropdown';
import { tokens } from '../../styles/theme';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  mode?: 'single' | 'range';
  value?: Date | DateRange | null;
  onChange?: (date: Date | DateRange | null) => void;
  error?: string;
  disabled?: boolean;
  triggerClassName?: string;
}

export const DatePicker = ({
  label,
  placeholder,
  mode = 'single',
  value,
  onChange,
  error,
  disabled,
  triggerClassName,
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

  const getDisplayValue = () => {
    if (!value) return null;

    if (mode === 'single') {
      const dateValue = value instanceof Date ? value : (value ? new Date(value as any) : null);
      if (dateValue && !isNaN(dateValue.getTime())) {
        return format(dateValue, "d 'de' MMMM, yyyy", { locale: es });
      }
      return null;
    } else {
      const range = value as DateRange;
      if (!range.start) return null;
      if (!range.end) return format(range.start, "d 'de' MMMM", { locale: es });
      return `${format(range.start, 'd MMM')} - ${format(range.end, 'd MMM, yyyy')}`;
    }
  };

  const displayValue = getDisplayValue();

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className={tokens.inputLabel}>
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={
            triggerClassName
              ? `${triggerClassName} ${error ? tokens.inputError : ''}`
              : `${tokens.selectTrigger} ${error ? tokens.inputError : ''} ${open ? tokens.selectTriggerFocus : ''} flex items-center gap-3`
          }
        >
          <CalendarIcon className="w-4 h-4 text-dark/40" />
          <span className={`flex-1 truncate text-[13px] ${!displayValue ? 'text-dark/40 font-sans-normal' : 'text-dark font-sans-medium'}`}>
            {displayValue || placeholder || (mode === 'range' ? t('ui.selectDateRange') : t('ui.selectDate'))}
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
              >
                <X className="w-3 h-3 text-dark/40" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

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
                if (mode === 'single' || (mode === 'range' && (v as DateRange).end)) {
                  setOpen(false);
                }
              }}
              className="w-full max-w-[320px]"
            />
          </div>,
          document.body
        )}
      </div>

      {error && (
        <p className={tokens.inputErrorMsg}>
          {error}
        </p>
      )}
    </div>
  );
};
