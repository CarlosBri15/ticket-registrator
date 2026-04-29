import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: SearchInputProps) => (
  <div
    className={`flex items-center gap-2 px-3 h-10 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] transition-colors duration-100 focus-within:border-dark/40 focus-within:ring-2 focus-within:ring-dark/8 ${className ?? ''}`}
  >
    <Search className="w-4 h-4 text-dark/30 shrink-0" aria-hidden={true} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      className="flex-1 bg-transparent text-[13px] font-sans-normal text-dark placeholder:text-dark/35 focus:outline-none"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="text-dark/30 hover:text-dark transition-colors shrink-0"
        aria-label="clear search"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
