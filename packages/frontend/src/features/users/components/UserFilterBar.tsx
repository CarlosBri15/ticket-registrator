import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DARK } from "../constants";

export interface UserFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

export const UserFilterBar = ({
  search,
  onSearch,
  hasFilters,
  onClear,
}: UserFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <PixelCard shadowOffset={3} className="flex-1">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}60` }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("users.searchPlaceholder")}
            className="flex-1 min-w-0 bg-transparent text-sm font-space-semibold text-dark placeholder:text-dark/40 placeholder:font-space focus:outline-none"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearch("")}
              className="!w-6 !h-6 !p-0 !border-none !shadow-none opacity-40 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </PixelCard>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="!border-none !shadow-none"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
