/**
 * ReportRow — Compact report card used in lists (history, dashboards).
 */
import { memo } from "react";
import { Calendar } from "lucide-react";
import { format, type Locale } from "date-fns";
import { type IReport } from "@ticket-registrator/shared";
import { reportIcon } from "@ticket-registrator/shared/assets";
import { PixelCard } from "../../../components/ui/PixelCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DARK } from "../constants";

interface ReportRowProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
}

export const ReportRow = memo(({ report, onClick, dateLocale }: ReportRowProps) => (
  <PixelCard onClick={onClick} className="w-full">
    <div className="flex items-center gap-4 px-4 py-3.5">
      <img
        src={reportIcon}
        alt=""
        className="w-14 h-14 object-contain shrink-0 select-none"
      />
      <div className="flex-1 min-w-0">
        <p className="font-space-bold text-dark truncate" style={{ fontSize: 15 }}>
          {report.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className="w-3 h-3" style={{ color: `${DARK}50` }} />
          <span className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}60` }}>
            {format(new Date(report.start_date ?? report.end_date), "dd MMM", { locale: dateLocale })}
            {report.end_date && report.end_date !== report.start_date &&
              ` – ${format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}`}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <StatusBadge status={report.status} size="md" />
        <span className="font-space-bold text-dark tabular-nums" style={{ fontSize: 16 }}>
          {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
          <span className="font-space-bold" style={{ fontSize: 11, color: `${DARK}50` }}>
            {" "}{report.currency}
          </span>
        </span>
      </div>
    </div>
  </PixelCard>
));
