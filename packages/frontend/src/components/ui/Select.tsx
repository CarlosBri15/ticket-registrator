import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useDropdown } from '../../hooks/useDropdown';

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
    'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border bg-white',
    'text-sm font-medium transition-all duration-300 shadow-sm text-left',
    'hover:border-secondary hover:shadow-md',
    'focus:outline-none',
    'peer-focus:border-brand peer-focus:ring-4 peer-focus:ring-brand/5 peer-focus:shadow-xl peer-focus:shadow-brand/5',
    'disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed',
    error
      ? 'border-accent/50 peer-focus:border-accent peer-focus:ring-accent/5 bg-accent/[0.02]'
      : 'border-gray-200',
  ].join(' ');

  return (
    <div className="w-full group" ref={containerRef}>
      {/* Label */}
      <label
        htmlFor={selectId}
        className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-brand transition-colors"
      >
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>

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
          <span className={isPlaceholder ? 'text-gray-400 font-normal' : 'text-dark'}>
            {isLoading ? 'Cargando...' : (displayValue ?? placeholder ?? 'Selecciona una opción')}
          </span>
          <span className="shrink-0 ml-2 text-gray-400">
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
            className="bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 font-medium text-center">
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
                    className={[
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors text-left',
                      isSelected
                        ? 'bg-brand/10 text-brand'
                        : 'text-dark hover:bg-brand/5 hover:text-brand',
                    ].join(' ')}
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
        <div className="flex items-center gap-1.5 mt-2 ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <p className="text-xs text-accent font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
};
