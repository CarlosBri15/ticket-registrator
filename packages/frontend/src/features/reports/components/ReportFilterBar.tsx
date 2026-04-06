/**
 * ReportFilterBar — Underline-only minimalist filter bar.
 * Search · Date range · Status dropdown — all with bottom-border only.
 */
import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATUS_OPTIONS } from "../constants";
import { DatePicker } from "../../../components/ui/DatePicker";
import type { DateRange } from "../../../components/ui/Calendar";

export interface ReportFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatus: (v: string) => void;
  dateRange: DateRange | null;
  onDateRange: (v: DateRange | null) => void;
  hasFilters: boolean;
  onClear: () => void;
}

// Shared underline trigger class — bottom border only, no box, no radius.
const underlineTrigger =
  "w-full flex items-center gap-2.5 pb-2 border-b border-[var(--color-border-main)] bg-transparent transition-colors duration-100 focus:outline-none hover:border-dark/40 cursor-pointer";

export const ReportFilterBar = ({
  search, onSearch,
  statusFilter, onStatus,
  dateRange, onDateRange,
  hasFilters, onClear,
}: ReportFilterBarProps) => {
  const { t } = useTranslation();
  const [statusOpen, setStatusOpen] = useState(false);

  const statusLabel = statusFilter === "ALL" ? t("trips.filterAll") : t(`status.${statusFilter}`);
  const statusActive = statusFilter !== "ALL";

  return (
    <div className="flex items-end gap-6">

      {/* Search */}
      <div className={`flex-1 flex items-center gap-2 pb-2 border-b transition-colors duration-100 ${search ? "border-dark/60" : "border-[var(--color-border-main)]"} focus-within:border-dark/60`}>
        <Search className="w-3.5 h-3.5 shrink-0 text-dark/35" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("trips.filterSearch")}
          className="flex-1 min-w-0 bg-transparent text-[13px] font-sans-medium text-dark placeholder:text-dark/35 placeholder:font-sans-normal focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="text-dark/30 hover:text-dark/60 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="w-[240px]">
        <DatePicker
          mode="range"
          value={dateRange}
          onChange={(val) => onDateRange(val as DateRange | null)}
          placeholder={t("trips.filterPeriod")}
          triggerClassName={`${underlineTrigger} ${dateRange ? "border-dark/60" : ""}`}
        />
      </div>

      {/* Status */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen((o) => !o)}
          className={`flex items-center gap-1.5 pb-2 border-b transition-colors duration-100 focus:outline-none ${
            statusActive || statusOpen
              ? "border-dark/70 text-dark"
              : "border-[var(--color-border-main)] text-dark/45 hover:border-dark/40 hover:text-dark/70"
          }`}
        >
          <span className={`font-sans-medium text-[13px] whitespace-nowrap ${statusActive ? "text-dark" : ""}`}>
            {statusLabel}
          </span>
          <ChevronDown className={`w-3 h-3 shrink-0 opacity-50 transition-transform duration-150 ${statusOpen ? "rotate-180" : ""}`} />
        </button>

        {statusOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
              aria-label="Close status filter"
            />
            <div className="absolute right-0 top-full mt-2 z-20 py-1 min-w-[160px] bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg shadow-[0px_8px_24px_rgba(28,25,23,0.08)]">
              {STATUS_OPTIONS.map((s, idx) => {
                const active = statusFilter === s;
                const label = s === "ALL" ? t("trips.filterAll") : t(`status.${s}`);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onStatus(s); setStatusOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--color-surface)] ${
                      idx < STATUS_OPTIONS.length - 1 ? "border-b border-[var(--color-border-main)]/50" : ""
                    } ${active ? "font-sans-semibold text-dark" : "font-sans-medium text-dark/65"}`}
                  >
                    {label}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-dark shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="pb-2 text-[12px] font-sans-medium text-dark/35 hover:text-dark/70 transition-colors whitespace-nowrap border-b border-transparent"
          aria-label="Clear filters"
        >
          {t("trips.filterClearAll")}
        </button>
      )}

    </div>
  );
};
