import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { TFunction } from "i18next";
import { FileText } from "lucide-react";
import { type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../../../components/ui/StatusBadge";

interface RecentActivitySectionProps {
  t: TFunction;
  recentCompleted: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
}

const ROW_GRID = "32px 1fr auto";

export const RecentActivitySection = ({
  t,
  recentCompleted,
  navigate,
  dateLocale,
}: RecentActivitySectionProps) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-sans-semibold text-dark/45">
        {t("home.recentActivity")}
      </p>
      <button
        type="button"
        onClick={() => navigate("/reports")}
        className="text-[12px] font-sans-medium text-dark/50 hover:text-dark underline underline-offset-2 transition-colors"
      >
        {t("common.viewAll")}
      </button>
    </div>

    {recentCompleted.length === 0 ? (
      <p className="text-[13px] font-sans-medium text-dark/50 text-center py-6">
        {t("trips.noCompletedTrips")}
      </p>
    ) : (
      recentCompleted.map((report) => (
        <button
          key={report.id}
          type="button"
          onClick={() => navigate(`/reports/${report.id}`)}
          className="list-row group w-full text-left gap-3"
          style={{ gridTemplateColumns: ROW_GRID }}
        >
          <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white shrink-0">
            <FileText className="w-3.5 h-3.5" aria-hidden={true} />
          </div>
          <div className="min-w-0">
            <p className="row-name truncate">{report.name}</p>
            <p className="row-meta mt-0.5">
              {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="row-num leading-none">
              {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
              {report.currency && <span className="cur">{report.currency}</span>}
            </span>
            <StatusBadge status={report.status} />
          </div>
        </button>
      ))
    )}
  </section>
);
