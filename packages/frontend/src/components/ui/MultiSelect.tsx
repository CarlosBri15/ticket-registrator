import { useEffect, useRef } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export type { SelectOption } from './Select';
import type { SelectOption } from './Select';
import { useDropdown } from '../../hooks/useDropdown';
import { BaseSelect } from './BaseSelect';

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
  const { t } = useTranslation();
  const selectId = id ?? `multiselect-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;
  const { open, setOpen, containerRef, triggerRef, dropdownStyle, handleKeyDown } =
    useDropdown({ id: selectId });

  const nativeSelectRef = useRef<HTMLSelectElement>(null);

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
        .map((v: string) => options.find((o) => o.value === v)?.label ?? v)
        .join(', ');
    }
    return t('ui.selected', { count: value.length });
  };

  const handleToggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange?.(value.filter((v: string) => v !== optValue));
    } else {
      onChange?.([...value, optValue]);
    }
  };

  return (
    <BaseSelect
      label={label}
      required={required}
      error={error}
      disabled={disabled}
      isLoading={isLoading}
      id={selectId}
      displayValue={getDisplayValue()}
      placeholder={placeholder}
      emptyI18nKey="ui.selectOptions"
      open={open}
      onToggle={() => setOpen((v: boolean) => !v)}
      triggerRef={triggerRef}
      containerRef={containerRef}
      handleKeyDown={handleKeyDown}
      dropdownStyle={dropdownStyle}
      triggerTestId="multiselect-trigger"
      dropdownTestId="multiselect-dropdown"
      nativeSelect={
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
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      }
    >
      <div className="flex items-center gap-3 px-4 py-2 border-b-2 border-border-main">
        <button
          type="button"
          data-testid="multiselect-select-all"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange?.(options.map((o) => o.value))}
          className="text-xs font-space-bold text-brand hover:text-brand/80 transition-colors"
        >
          {t('ui.selectAll')}
        </button>
        <span className="text-dark/20">|</span>
        <button
          type="button"
          data-testid="multiselect-clear"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange?.([])}
          className="text-xs font-space-bold text-dark/40 hover:text-dark transition-colors"
        >
          {t('ui.clear')}
        </button>
      </div>

      {options.length === 0 ? (
        <div className="px-3.5 py-3 text-sm text-slate-400 font-medium text-center">
          {t('ui.noOptions')}
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
              className={`select-option${isSelected ? " is-active" : ""}`}
            >
              <span>{opt.label}</span>
              {isSelected
                ? <CheckSquare className="w-4 h-4 shrink-0" aria-hidden={true} />
                : <Square className="w-4 h-4 shrink-0 text-dark/20" aria-hidden={true} />
              }
            </button>
          );
        })
      )}
    </BaseSelect>
  );
};
