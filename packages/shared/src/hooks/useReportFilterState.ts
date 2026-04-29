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

export const useReportFilterState = (): UseReportFilterStateReturn => {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [dateRange, setDateRange]         = useState<DateRange | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!(search.trim() || statusFilter !== "ALL" || dateRange),
    [search, statusFilter, dateRange],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
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
