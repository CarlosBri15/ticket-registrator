import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, CheckSquare, Square } from 'lucide-react';
export type { SelectOption } from './Select';
import type { SelectOption } from './Select';
import { useDropdown } from '../../hooks/useDropdown';

export interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  id?: string;
}

export const MultiSelect = ({
  label = '',
  options,
  value = [],
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  isLoading = false,
  id,
}: MultiSelectProps) => {
  const selectId = id ?? `multiselect-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;
  const {
    open,
    setOpen,
    containerRef,
    triggerRef,
    dropdownStyle,
    handleKeyDown,
  } = useDropdown({ id: selectId });

  const nativeSelectRef = useRef<HTMLSelectElement>(null);

  // Sync native select value via ref
  useEffect(() => {
    if (!nativeSelectRef.current) return;
    const opts = Array.from(nativeSelectRef.current.options);
    for (const opt of opts) {
      opt.selected = value.includes(opt.value);
    }
  }, [value]);

  const getDisplayValue = () => {
    if (value.length === 0) return null;
    if (value.length <= 2) {
      return value
        .map((v) => options.find((o) => o.value === v)?.label ?? v)
        .join(', ');
    }
    return `${value.length} seleccionados`;
  };

  const displayValue = getDisplayValue();
  const isPlaceholder = displayValue === null;

  const handleToggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange?.(value.filter((v) => v !== optValue));
    } else {
      onChange?.([...value, optValue]);
    }
  };

  const handleSelectAll = () => {
    onChange?.(options.map((o) => o.value));
  };

  const handleClear = () => {
    onChange?.([]);
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
          ref={nativeSelectRef}
          data-testid="multiselect-native"
          multiple
          disabled={disabled || isLoading}
          required={required}
          className="sr-only peer"
          aria-required={required}
          onChange={() => {/* controlled via ref */}}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger - visual representation */}
        <button
          ref={triggerRef}
          data-testid="multiselect-trigger"
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled || isLoading}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKeyDown}
          className={triggerClasses}
        >
          <span className={isPlaceholder ? 'text-gray-400 font-normal' : 'text-dark'}>
            {isLoading ? 'Cargando...' : (displayValue ?? placeholder ?? 'Selecciona opciones')}
          </span>
          <span className="shrink-0 ml-2 text-gray-400">
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden={true} />
              : <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden={true} />
            }
          </span>
        </button>

        {/* Dropdown panel — rendered via portal */}
        {open && createPortal(
          <div
            id={`${selectId}-listbox`}
            data-testid="multiselect-dropdown"
            aria-hidden="true"
            data-listbox={selectId}
            style={dropdownStyle}
            className="bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto"
          >
            {/* Select all / Clear controls */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
              <button
                type="button"
                data-testid="multiselect-select-all"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSelectAll}
                className="text-xs font-bold text-brand hover:text-brand/80 transition-colors"
              >
                Seleccionar todo
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                data-testid="multiselect-clear"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="text-xs font-bold text-gray-400 hover:text-dark transition-colors"
              >
                Limpiar
              </button>
            </div>

            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 font-medium text-center">
                Sin opciones disponibles
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    data-testid={`multiselect-option-${opt.value}`}
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => handleToggle(opt.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={[
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors text-left',
                      isSelected
                        ? 'bg-brand/10 text-brand'
                        : 'text-dark hover:bg-brand/5 hover:text-brand',
                    ].join(' ')}
                  >
                    <span>{opt.label}</span>
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 shrink-0" aria-hidden={true} />
                      : <Square className="w-4 h-4 shrink-0 text-gray-300" aria-hidden={true} />
                    }
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
