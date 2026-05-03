import type { ReactNode } from "react";
import { Plus, Camera, ChevronRight } from "lucide-react";
import type { Locale } from "date-fns";
import type { IReport } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { ReportCard } from "../../reports/components/ReportCard";
import { ReportRowItem } from "../../reports/components/ReportRow";

interface UserSelfDashboardProps {
  currentTrip: IReport | null;
  inReviewReports: IReport[];
  recentCompleted: IReport[];
  firstName: string;
  todayLabel: string;
  navigate: (path: string) => void;
  onUpload: () => void;
  dateLocale: Locale;
  t: (key: string, options?: Record<string, unknown>) => string;
  companyBanner?: ReactNode;
}

/**
 * Mobile-style dashboard layout for users whose scope is `self` — i.e. an
 * employee that only sees their own trips. Shows the active trip on top,
 * pending-review reports below, and the most recent completed reports.
 */
export const UserSelfDashboard = ({
  currentTrip,
  inReviewReports,
  recentCompleted,
  firstName,
  todayLabel,
  navigate,
  onUpload,
  dateLocale,
  t,
  companyBanner,
}: UserSelfDashboardProps) => (
  <div className="flex flex-col gap-10 pb-12">
    {companyBanner}

    {/* Greeting */}
    <div className="flex items-end justify-between pt-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight">
          {firstName}
        </h1>
        <p className="text-[11px] font-sans-medium text-dark/45 capitalize">{todayLabel}</p>
      </div>
    </div>

    {/* Active report */}
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-sans-semibold text-dark/45">{t("home.activeTrip")}</p>
      {currentTrip ? (
        <>
          <ReportCard
            report={currentTrip}
            onClick={() => navigate(`/reports/${currentTrip.id}`)}
            dateLocale={dateLocale}
          />
          <button
            type="button"
            onClick={onUpload}
            className="self-start flex items-center gap-1.5 font-sans-medium text-[12px] text-dark/40 hover:text-dark transition-colors mt-0.5"
          >
            <Camera className="w-3 h-3" />
            {t("home.scanTicket")}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3 py-4">
          <p className="font-sans-normal text-dark/40 text-[13px]">
            {t("trips.noActiveTrips")}
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate("/reports")}
          >
            {t("home.createFirst")}
          </Button>
        </div>
      )}
    </div>

    {/* In review */}
    {inReviewReports.length > 0 && (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-sans-semibold text-dark/45">{t("dashboard.inReview")}</p>
          <span className="text-[11px] font-sans-bold text-dark/25 tabular-nums">
            {inReviewReports.length}
          </span>
        </div>
        <div className="w-full">
          {inReviewReports.map((r) => (
            <ReportRowItem
              key={r.id}
              report={r}
              onClick={() => navigate(`/reports/${r.id}`)}
              dateLocale={dateLocale}
            />
          ))}
        </div>
      </div>
    )}

    {/* Recent completed */}
    {recentCompleted.length > 0 && (
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-sans-semibold text-dark/45">{t("home.recentActivity")}</p>
        <div className="w-full">
          {recentCompleted.map((r) => (
            <ReportRowItem
              key={r.id}
              report={r}
              onClick={() => navigate(`/reports/${r.id}`)}
              dateLocale={dateLocale}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="self-start flex items-center gap-1 font-sans-medium text-[12px] text-dark/40 hover:text-dark transition-colors mt-0.5"
        >
          {t("common.viewAll")}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    )}
  </div>
);
