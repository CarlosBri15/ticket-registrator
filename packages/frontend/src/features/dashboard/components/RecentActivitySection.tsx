import { Clock } from "lucide-react";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { TFunction } from "react-i18next";
import { type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
import { reportIcon } from "@ticket-registrator/shared/assets";
import { SectionHeader } from "../../../components/ui/SectionHeader";

interface RecentActivitySectionProps {
  t: TFunction;
  recentCompleted: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
}

export const RecentActivitySection = ({
  t,
  recentCompleted,
  navigate,
  dateLocale,
}: RecentActivitySectionProps) => {
  return (
    <section className="space-y-3.5">
      <SectionHeader
        icon={<Clock />}
        title={t("home.recentActivity")}
        action={
          <button
            onClick={() => navigate("/reports")}
            className="text-xs font-space-bold text-brand hover:underline"
          >
            {t("common.viewAll")}
          </button>
        }
      />

      {recentCompleted.length === 0 ? (
        <p className="text-sm font-space text-dark/50 text-center py-6">
          {t("trips.noCompletedTrips")}
        </p>
      ) : (
        <div className="space-y-2.5">
          {recentCompleted.map((report) => (
            <PixelCard
              key={report.id}
              shadowOffset={3}
              onClick={() => navigate(`/reports/${report.id}`)}
              className="w-full"
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <img
                  src={reportIcon}
                  alt=""
                  className="w-11 h-11 shrink-0 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-space-bold text-[11px] text-dark truncate mb-0.5">
                    {report.name}
                  </p>
                  <span
                    className="font-space-semibold text-[8px]"
                    style={{ color: "rgba(26,26,26,0.7)" }}
                  >
                    {format(new Date(report.end_date), "dd MMM yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-space-bold text-[13px] text-dark leading-none">
                    {(
                      report.approved_amount ??
                      report.requested_amount ??
                      0
                    ).toLocaleString()}
                    <span
                      className="font-space-bold text-[8px] ml-0.5"
                      style={{ color: "rgba(26,26,26,0.6)" }}
                    >
                      {report.currency}
                    </span>
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                </div>
              </div>
            </PixelCard>
          ))}
        </div>
      )}
    </section>
  );
};
