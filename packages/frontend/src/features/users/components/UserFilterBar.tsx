import { useTranslation } from "react-i18next";
import { SearchInput } from "../../../components/ui/SearchInput";

export interface UserFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

export const UserFilterBar = ({ search, onSearch, hasFilters, onClear }: UserFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder={t("users.searchPlaceholder")}
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors px-2"
        >
          {t("trips.filterClearAll")}
        </button>
      )}
    </div>
  );
};
