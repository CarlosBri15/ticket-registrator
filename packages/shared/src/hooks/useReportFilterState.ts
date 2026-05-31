import { useState, useMemo, type Dispatch, type SetStateAction } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface UseReportFilterStateReturn {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  dateRange: DateRange | null;
  setDateRange: Dispatch<SetStateAction<DateRange | null>>;
  showAllHistory: boolean;
  setShowAllHistory: Dispatch<SetStateAction<boolean>>;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export interface UseReportFilterStateOptions {
  /**
   * Initial value for the status filter. Defaults to `"ALL"`. Pass a different
   * value (e.g. `"Submitted"`) for roles that should land on a pre-filtered
   * view — `clearFilters` will reset to this same value, and `hasActiveFilters`
   * treats it as the "neutral" state.
   */
  defaultStatusFilter?: string;
}

export const useReportFilterState = (
  options: UseReportFilterStateOptions = {},
): UseReportFilterStateReturn => {
  const defaultStatusFilter = options.defaultStatusFilter ?? "ALL";
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState(defaultStatusFilter);
  const [dateRange, setDateRange]         = useState<DateRange | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!(search.trim() || statusFilter !== defaultStatusFilter || dateRange),
    [search, statusFilter, dateRange, defaultStatusFilter],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(defaultStatusFilter);
    setDateRange(null);
  };

  return {
    search,       setSearch,
    statusFilter, setStatusFilter,
    dateRange,    setDateRange,
    showAllHistory, setShowAllHistory,
    hasActiveFilters,
    clearFilters,
  };
};
