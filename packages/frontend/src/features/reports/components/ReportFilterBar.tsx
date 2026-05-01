/**
 * ReportFilterBar — kit `.toolbar + .chip + .input-search` pattern.
 * Search input on the left, date range and status as chip-triggered
 * popovers, optional clear-all on the right.
 */
import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATUS_OPTIONS } from "@ticket-registrator/shared";
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

const chipTrigger = "chip whitespace-nowrap focus:outline-none";

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
    <div className="toolbar">
      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 max-w-[420px]">
        <Search
          className="w-3.5 h-3.5 text-dark/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden={true}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("trips.filterSearch")}
          className="input input-search pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-dark/30 hover:text-dark/60 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" aria-hidden={true} />
          </button>
        )}
      </div>

      {/* ── Date range (DatePicker styled as chip) ───────────────────────── */}
      <DatePicker
        mode="range"
        value={dateRange}
        onChange={(val) => onDateRange(val as DateRange | null)}
        placeholder={t("trips.filterPeriod", "Period")}
        triggerClassName={`${chipTrigger}${dateRange ? " active" : ""}`}
      />

      {/* ── Status chip + popover ────────────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen((o) => !o)}
          className={`${chipTrigger}${statusActive || statusOpen ? " active" : ""}`}
          aria-expanded={statusOpen}
          aria-haspopup="listbox"
        >
          <span>{statusLabel}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform duration-150 ${statusOpen ? "rotate-180" : ""}`}
            aria-hidden={true}
          />
        </button>

        {statusOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setStatusOpen(false)}
              aria-label="Close status filter"
            />
            <div
              role="listbox"
              className="absolute right-0 top-full mt-2 z-20 py-1 min-w-[160px] bg-[var(--color-surface-card)] border border-[var(--color-border-main)] rounded-lg shadow-[0px_8px_24px_rgba(28,25,23,0.08)]"
            >
              {STATUS_OPTIONS.map((s, idx) => {
                const active = statusFilter === s;
                const label = s === "ALL" ? t("trips.filterAll") : t(`status.${s}`);
                return (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onStatus(s);
                      setStatusOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--color-surface-hover)] ${
                      idx < STATUS_OPTIONS.length - 1 ? "border-b border-[var(--color-border-main)]/50" : ""
                    } ${active ? "font-sans-semibold text-dark" : "font-sans-medium text-dark/65"}`}
                  >
                    {label}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-dark shrink-0" aria-hidden={true} />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Clear all (right-aligned) ────────────────────────────────────── */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-[12px] font-sans-medium text-dark/45 hover:text-dark transition-colors whitespace-nowrap"
          aria-label="Clear filters"
        >
          {t("trips.filterClearAll")}
        </button>
      )}
    </div>
  );
};
