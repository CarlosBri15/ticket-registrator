/**
 * ReportRow — Fila de reporte minimalista.
 *
 * Sin avatar: el nombre arranca directo en px-4 y coincide exactamente
 * con la cabecera "Nombre" de TableHeader.
 *
 * Exports:
 *  - ReportRow     → standalone con wrapper propio.
 *  - ReportRowItem → fila pura, para el listado paginado.
 */
import { memo } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { format, type Locale } from "date-fns";
import { type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { tokens } from "../../../styles/theme";
import { REPORT_GRID } from "../../../constants/gridLayouts";

interface ReportRowProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
}

const ReportRowContent = ({
  report,
  dateLocale,
}: Pick<ReportRowProps, "report" | "dateLocale">) => {
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
    <div className="w-full grid items-center gap-4 px-4 py-3.5" style={{ gridTemplateColumns: REPORT_GRID }}>

      {/* Icono */}
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center">
        <FileText className="w-3.5 h-3.5 text-dark/40" />
      </div>

      {/* Nombre + Tipo */}
      <div className="min-w-0">
        <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
          {report.name}
        </p>
        {report.type && (
          <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
            {report.type}
          </p>
        )}
      </div>

      {/* Estado */}
      <div className="flex items-center justify-center">
        <StatusBadge status={report.status} />
      </div>

      {/* Fecha */}
      <p className="font-sans-medium text-[12px] text-dark/60 text-center whitespace-nowrap">
        {dateStart}{dateEnd}
      </p>

      {/* Importe */}
      <p className="font-sans-bold text-dark tabular-nums text-right text-[14px]">
        {amount}
        {report.currency && (
          <span className="font-sans-medium ml-1 text-dark/50 text-[11px]">
            {report.currency}
          </span>
        )}
      </p>

      {/* Chevron — solo en hover */}
      <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />

    </div>
  );
};

export const ReportRow = memo(({ report, onClick, dateLocale }: ReportRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`group w-full text-left ${tokens.card} overflow-hidden cursor-pointer hover:bg-[var(--color-secondary)] transition-colors duration-100`}
  >
    <ReportRowContent report={report} dateLocale={dateLocale} />
  </button>
));

export const ReportRowItem = memo(({ report, onClick, dateLocale }: ReportRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] cursor-pointer transition-colors duration-100"
  >
    <ReportRowContent report={report} dateLocale={dateLocale} />
  </button>
));
