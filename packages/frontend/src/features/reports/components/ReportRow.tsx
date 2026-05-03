/**
 * ReportRow — single source for a report list row, used both standalone
 * and inside paginated lists. Renders the kit `.list-row` primitive
 * (bordered card with 6px margin-bottom + grid columns from REPORT_GRID).
 *
 * `ReportRowItem` is kept as an alias for callers that imported the old
 * "compact variant" name; both render identically.
 */
import { memo } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { format, type Locale } from "date-fns";
import { type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { REPORT_GRID } from "../../../constants/gridLayouts";

interface ReportRowProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
}

export const ReportRow = memo(({ report, onClick, dateLocale }: ReportRowProps) => {
  const amount = (report.approved_amount ?? report.requested_amount ?? 0).toLocaleString();

  const dateStart = format(
    new Date(report.start_date ?? report.end_date),
    "dd MMM",
    { locale: dateLocale },
  );
  const dateEnd =
    report.end_date && report.end_date !== report.start_date
      ? ` – ${format(new Date(report.end_date), "dd MMM yy", { locale: dateLocale })}`
      : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="list-row group w-full text-left gap-4"
      style={{ gridTemplateColumns: REPORT_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center">
        <FileText className="w-3.5 h-3.5 text-dark/40" aria-hidden={true} />
      </div>

      <div className="min-w-0">
        <p className="row-name truncate">{report.name}</p>
        {report.type && (
          <p className="row-meta truncate mt-0.5">{report.type}</p>
        )}
      </div>

      <div className="flex items-center justify-center">
        <StatusBadge status={report.status} />
      </div>

      <p className="row-meta text-center whitespace-nowrap">
        {dateStart}{dateEnd}
      </p>

      <p className="row-num text-right">
        {amount}
        {report.currency && <span className="cur">{report.currency}</span>}
      </p>

      <ChevronRight
        className="row-chev w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        aria-hidden={true}
      />
    </button>
  );
});

/** @deprecated Use `ReportRow`. Kept as alias for callers that imported the
 *  old "compact list" variant — both render identically now. */
export const ReportRowItem = ReportRow;
