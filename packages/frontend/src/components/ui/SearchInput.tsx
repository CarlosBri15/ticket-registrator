import { Search, X } from "lucide-react";
import { tokens } from "../../styles/theme";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ value, onChange, placeholder, className }: SearchInputProps) => (
  <div className={`flex items-center gap-2.5 px-4 py-3 border-2 border-border-main rounded-2xl bg-[var(--color-surface-card)] shadow-hard-sm ${className ?? ""}`}>
    <Search className="w-4 h-4 text-dark/30 shrink-0" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={tokens.searchInput}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="text-dark/30 hover:text-dark transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
