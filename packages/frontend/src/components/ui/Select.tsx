import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDropdown } from '../../hooks/useDropdown';
import { tokens } from '../../styles/theme';
import { BaseSelect } from './BaseSelect';

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
  const { t } = useTranslation();
  const selectId = id ?? `select-${label.toLowerCase().replaceAll(/\s+/g, '-')}`;
  const { open, setOpen, containerRef, triggerRef, dropdownStyle, handleKeyDown } =
    useDropdown({ id: selectId });

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = (optValue: string) => {
    onChange?.(optValue);
    setOpen(false);
  };

  return (
    <BaseSelect
      label={label}
      required={required}
      error={error}
      disabled={disabled}
      isLoading={isLoading}
      id={selectId}
      displayValue={selectedLabel ?? null}
      placeholder={placeholder}
      emptyI18nKey="ui.selectOption"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      triggerRef={triggerRef}
      containerRef={containerRef}
      handleKeyDown={handleKeyDown}
      dropdownStyle={dropdownStyle}
      triggerTestId="select-trigger"
      dropdownTestId="select-dropdown"
      nativeSelect={
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
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      }
    >
      {options.length === 0 ? (
        <div className="px-3.5 py-3 text-sm text-slate-400 font-medium text-center">
          {t('ui.noOptions')}
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
    </BaseSelect>
  );
};
