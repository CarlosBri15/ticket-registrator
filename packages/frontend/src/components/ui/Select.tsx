import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useDropdown } from '../../hooks/useDropdown';
import { tokens } from '../../styles/theme';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  id?: string;
}

export const Select = ({
  label = '',
  options,
  value = '',
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  isLoading = false,
  id,
}: SelectProps) => {
  const selectId = id ?? `select-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;
  const {
    open,
    setOpen,
    containerRef,
    triggerRef,
    dropdownStyle,
    handleKeyDown,
  } = useDropdown({ id: selectId });

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const displayValue = selectedLabel ?? placeholder;
  const isPlaceholder = !selectedLabel;

  const handleSelect = (optValue: string) => {
    onChange?.(optValue);
    setOpen(false);
  };

  const triggerClasses = [
    tokens.selectTrigger,
    open ? tokens.selectTriggerFocus : '',
    error ? tokens.inputError : '',
  ].join(' ');

  return (
    <div className="w-full" ref={containerRef}>
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className={tokens.inputLabel}>
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <div className="relative">
        {/* Native select for accessibility */}
        <select
          id={selectId}
          data-testid="select-native"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || isLoading}
          required={required}
          className="sr-only peer"
          aria-required={required}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger */}
        <button
          ref={triggerRef}
          data-testid="select-trigger"
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled || isLoading}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKeyDown}
          className={triggerClasses}
        >
          <span className={isPlaceholder ? 'text-slate-400 font-normal' : 'text-dark'}>
            {isLoading ? 'Cargando...' : (displayValue ?? placeholder ?? 'Selecciona una opción')}
          </span>
          <span className="shrink-0 ml-2 text-slate-400">
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden={true} />
              : <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden={true} />
            }
          </span>
        </button>

        {/* Dropdown panel */}
        {open && createPortal(
          <div
            id={`${selectId}-listbox`}
            data-testid="select-dropdown"
            aria-hidden="true"
            data-listbox={selectId}
            style={dropdownStyle}
            className={tokens.selectDropdown}
          >
            {options.length === 0 ? (
              <div className="px-3.5 py-3 text-sm text-slate-400 font-medium text-center">
                Sin opciones disponibles
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    data-testid={`select-option-${opt.value}`}
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => handleSelect(opt.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`${tokens.selectOption} ${isSelected ? tokens.selectOptionActive : tokens.selectOptionIdle}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" aria-hidden={true} />}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className={tokens.inputErrorMsg}>{error}</p>
      )}
    </div>
  );
};
