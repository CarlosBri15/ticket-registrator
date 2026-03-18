import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const displayValue = selectedLabel ?? placeholder;
  const isPlaceholder = !selectedLabel;

  const updateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest(`[data-listbox="${selectId}"]`)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open, updateDropdownPosition, selectId]);

  const handleSelect = (optValue: string) => {
    onChange?.(optValue);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
  };

  const triggerClasses = [
    'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border bg-white',
    'text-sm font-medium transition-all duration-300 shadow-sm text-left',
    'hover:border-secondary hover:shadow-md',
    'focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 focus:shadow-xl focus:shadow-brand/5',
    'disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed',
    error
      ? 'border-accent/50 focus:border-accent focus:ring-accent/5 bg-accent/[0.02]'
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
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${selectId}-listbox`}
          aria-required={required}
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

        {/* Dropdown panel — rendered via portal to escape overflow:hidden containers */}
        {open && createPortal(
          <ul
            id={`${selectId}-listbox`}
            role="listbox"
            aria-label={label}
            data-listbox={selectId}
            style={dropdownStyle}
            className="bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 font-medium text-center">
                Sin opciones disponibles
              </li>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt.value)}
                    className={[
                      'flex items-center justify-between px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-brand/10 text-brand'
                        : 'text-dark hover:bg-brand/5 hover:text-brand',
                    ].join(' ')}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" aria-hidden={true} />}
                  </li>
                );
              })
            )}
          </ul>,
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
