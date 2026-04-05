import { useState, useMemo } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Manages the filter state for a report list screen.
 *
 * Tracks: text search, status filter, date range, and history expand/collapse.
 * Returns a stable `clearFilters` action and a `hasActiveFilters` flag.
 *
 * Usage:
 *   const filters = useReportFilterState();
 *   const visible = reports.filter(r => matchesFilters(r, filters));
 */
export const useReportFilterState = () => {
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
