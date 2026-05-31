/**
 * ReportFilterBar — composes the shared `<FilterBar />` primitives. Mirrors
 * the meta-row visual grammar of the `PageHeader` (icon + small label + bold
 * value + hairline dividers), so the filters and the detail header read as
 * one design vocabulary.
 */
import { Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATUS_OPTIONS } from "@ticket-registrator/shared";
import { DatePicker } from "../../../components/ui/DatePicker";
import {
  FilterBar,
  FilterClearAll,
  FilterDivider,
  FilterPopover,
  FilterSearch,
  FilterTrigger,
} from "../../../components/ui/FilterBar";
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
  search,
  onSearch,
  statusFilter,
  onStatus,
  dateRange,
  onDateRange,
  hasFilters,
  onClear,
}: ReportFilterBarProps) => {
  const { t } = useTranslation();

  const statusActive = statusFilter !== "ALL";
  const statusValue = statusActive ? t(`status.${statusFilter}`) : null;

  return (
    <FilterBar
      trailing={
        hasFilters ? (
          <FilterClearAll onClick={onClear}>
            {t("trips.filterClearAll")}
          </FilterClearAll>
        ) : null
      }
    >
      <FilterSearch
        value={search}
        onChange={onSearch}
        placeholder={t("trips.filterSearch")}
      />

      <FilterDivider />

      {/* ── Date range filter (DatePicker with custom trigger) ─────────── */}
      <DatePicker
        mode="range"
        value={dateRange}
        onChange={(val) => onDateRange(val as DateRange | null)}
        renderTrigger={({ open, displayValue, toggle, clear, attachTrigger }) => (
          <FilterTrigger
            ref={attachTrigger}
            icon={<Calendar className="w-4 h-4" />}
            label={t("trips.filterPeriod", "Period")}
            value={displayValue}
            placeholder={t("trips.filterAll")}
            active={!!displayValue}
            open={open}
            onClick={toggle}
            onClear={clear}
          />
        )}
      />

      <FilterDivider />

      {/* ── Status filter (custom popover with list of options) ────────── */}
      <FilterPopover
        align="right"
        panelClassName="py-1 min-w-[180px]"
        trigger={({ open, toggle, triggerRef, popoverId }) => (
          <FilterTrigger
            ref={triggerRef}
            popoverId={popoverId}
            icon={<Tag className="w-4 h-4" />}
            label={t("reports.tableStatus", "Estado")}
            value={statusValue}
            placeholder={t("trips.filterAll")}
            active={statusActive}
            open={open}
            onClick={toggle}
            onClear={statusActive ? () => onStatus("ALL") : undefined}
          />
        )}
      >
        {({ close }) =>
          STATUS_OPTIONS.map((s, idx) => {
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
                  close();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--color-surface-hover)] ${
                  idx < STATUS_OPTIONS.length - 1
                    ? "border-b border-[var(--color-border-main)]/50"
                    : ""
                } ${
                  active
                    ? "font-sans-semibold text-dark"
                    : "font-sans-medium text-dark/65"
                }`}
              >
                {label}
                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-dark shrink-0"
                    aria-hidden={true}
                  />
                )}
              </button>
            );
          })
        }
      </FilterPopover>
    </FilterBar>
  );
};
