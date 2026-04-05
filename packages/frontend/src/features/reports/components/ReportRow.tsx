/**
 * ReportRow — Compact report card used in lists (history, dashboards).
 */
import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { format, type Locale } from "date-fns";
import { type IReport, fonts } from "@ticket-registrator/shared";
import { reportIcon } from "@ticket-registrator/shared/assets";
import { PixelCard } from "../../../components/ui/PixelCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DARK, BRAND } from "../constants";

interface ReportRowProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
}

export const ReportRow = memo(({ report, onClick, dateLocale }: ReportRowProps) => (
  <PixelCard onClick={onClick} className="w-full">
    <div className="flex items-center gap-4 px-4 py-3">

      {/* Icon */}
      <img
        src={reportIcon}
        alt=""
        className="w-9 h-9 object-contain shrink-0 select-none"
      />

      {/* Nombre */}
      <div className="flex-[2] min-w-0">
        <p className="font-space-bold text-dark truncate" style={{ fontSize: 13 }}>
          {report.name}
        </p>
      </div>

      {/* Estado */}
      <div className="shrink-0 w-32 flex justify-center">
        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* Fecha */}
      <div className="shrink-0 w-40 flex justify-center">
        <p className="font-space-semibold tabular-nums whitespace-nowrap" style={{ fontSize: 12, color: `${DARK}70` }}>
          {format(new Date(report.start_date ?? report.end_date), "dd MMM", { locale: dateLocale })}
          {report.end_date && report.end_date !== report.start_date &&
            ` – ${format(new Date(report.end_date), "dd MMM yy", { locale: dateLocale })}`}
        </p>
      </div>

      {/* Dinero + moneda */}
      <div className="shrink-0 w-28 flex justify-end">
        <p className="font-space-bold text-dark tabular-nums leading-none" style={{ fontSize: 15 }}>
          {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
          {report.currency && (
            <span className="font-space-semibold ml-1" style={{ fontSize: 11, color: `${DARK}50` }}>
              {report.currency}
            </span>
          )}
        </p>
      </div>

      {/* Categoría */}
      <div className="shrink-0 w-28 flex justify-center">
        {report.type ? (
          <span
            className="inline-flex items-center font-space-bold whitespace-nowrap"
            style={{
              fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 10,
              color: BRAND, backgroundColor: `${BRAND}12`,
              paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
              borderRadius: 6, border: `1.5px solid ${BRAND}25`,
            }}
          >
            {report.type}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: `${DARK}25` }}>—</span>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: `${DARK}25` }} />

    </div>
  </PixelCard>
));
