/**
 * ReportCard — Fila compacta de una sola línea para el reporte activo.
 *
 * Todo el contenido fluye left-to-right sin justify-between:
 *   nombre · tipo · fecha · [estado pill] · importe [→ on hover]
 *
 * Elimina el gap vacío en el centro que tenía el diseño anterior.
 */
import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { format, type Locale } from "date-fns";
import { type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../../../components/ui/StatusBadge";

interface ReportCardProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
  isActive?: boolean;
}

export const ReportCard = memo(({
  report,
  onClick,
  dateLocale,
}: ReportCardProps) => {
  const amount = (report.requested_amount ?? 0).toLocaleString();

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
      className="group w-full text-left flex items-center gap-2.5 px-4 py-3.5 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-secondary)] hover:bg-dark/[0.03] transition-colors duration-100 overflow-hidden"
    >
      {/* Nombre */}
      <span className="font-sans-semibold text-dark text-[14px] shrink-0 truncate max-w-[240px]">
        {report.name}
      </span>

      {report.type && (
        <>
          <span className="text-dark/20 shrink-0 select-none">·</span>
          <span className="font-sans-medium text-[13px] text-dark/55 shrink-0 truncate max-w-[140px]">
            {report.type}
          </span>
        </>
      )}

      <span className="text-dark/20 shrink-0 select-none">·</span>
      <span className="font-sans-medium text-[13px] text-dark/55 shrink-0 whitespace-nowrap">
        {dateStart}{dateEnd}
      </span>

      <span className="text-dark/20 shrink-0 select-none">·</span>
      <StatusBadge status={report.status} size="sm" />

      <span className="text-dark/20 shrink-0 select-none">·</span>
      <span className="font-sans-bold text-dark text-[14px] tabular-nums shrink-0">
        {amount}
        {report.currency && (
          <span className="font-sans-medium ml-1 text-dark/50 text-[11px]">
            {report.currency}
          </span>
        )}
      </span>

      <ChevronRight className="ml-auto w-3.5 h-3.5 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0" />
    </button>
  );
});
