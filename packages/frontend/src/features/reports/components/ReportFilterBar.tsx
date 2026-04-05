/**
 * ReportFilterBar — Horizontal filter bar for the reports list.
 * Contains: search input, date-from, date-to, status dropdown, clear button.
 */
import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import { fonts } from "@ticket-registrator/shared";
import { PixelCard } from "../../../components/ui/PixelCard";
import { STATUS_OPTIONS, DARK, BORDER, SHADOW } from "../constants";
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
    <div className="flex items-center gap-2">

      {/* Search */}
      <PixelCard shadowOffset={3} className="flex-1">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}60` }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("trips.filterSearch")}
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

      {/* Date Range Picker */}
      <div className="w-[300px]">
        <DatePicker
          mode="range"
          value={dateRange}
          onChange={(val) => onDateRange(val as DateRange | null)}
          placeholder={t("trips.filterPeriod")}
        />
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <PixelCard
          bg={statusActive ? "#3B82F6" : "var(--color-surface-card)"}
          shadowOffset={3}
          active={statusActive || statusOpen}
          onClick={() => setStatusOpen((o) => !o)}
        >
          <div className="flex items-center justify-between gap-1.5 px-3 py-2.5 w-[148px]">
            <span
              className="font-space-bold truncate"
              style={{ fontSize: 11, color: statusActive ? "#fff" : DARK }}
            >
              {statusLabel}
            </span>
            <ChevronDown className="w-3 h-3 shrink-0" style={{ color: statusActive ? "#fff" : DARK }} />
          </div>
        </PixelCard>

        {statusOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
              aria-label="Close status filter"
            />
            <div
              className="absolute right-0 top-full mt-1 z-20 py-1 min-w-[160px]"
              style={{
                backgroundColor: "var(--color-surface-card)",
                border: `2px solid ${BORDER}`,
                borderRadius: 12,
                boxShadow: `5px 5px 0px ${SHADOW}`,
              }}
            >
              {STATUS_OPTIONS.map((s, idx) => {
                const active = statusFilter === s;
                const label = s === "ALL" ? t("trips.filterAll") : t(`status.${s}`);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onStatus(s); setStatusOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                    style={{
                      fontFamily: `'${fonts.family}', sans-serif`,
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      color: active ? "#3B82F6" : DARK,
                      borderBottom: idx < STATUS_OPTIONS.length - 1 ? `1px solid rgba(26, 26, 26, 0.15)` : "none",
                    }}
                  >
                    {label}
                    {active && (
                      <span
                        style={{
                          width: 18, height: 18, borderRadius: 6,
                          backgroundColor: "#3B82F6", border: `2px solid ${BORDER}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost-danger"
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
