/**
 * ReportCard — "Hero" card for the active/current report.
 *
 * Optionally accepts `onUpload` + `uploadLabel` to render a scan-ticket
 * button inside the card (used on the dashboard). Without those props the
 * whole card is a single clickable surface (used on ReportsScreen).
 */
import { memo } from "react";
import { Calendar, Camera, ChevronRight } from "lucide-react";
import { format, type Locale } from "date-fns";
import { fonts, nbTokens, type IReport } from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { reportIcon } from "@ticket-registrator/shared/assets";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DARK, BORDER } from "../constants";

interface ReportCardProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
  onUpload?: () => void;
  uploadLabel?: string;
}

const CardBody = ({ report, dateLocale }: Pick<ReportCardProps, "report" | "dateLocale">) => {
  const { t } = useTranslation();
  return (
  <>
    <div className="flex items-start justify-between gap-3 pt-5 px-5 mb-5">
      <p
        className="flex-1 font-space-bold text-dark leading-tight"
        style={{ fontSize: 26, letterSpacing: "-0.4px" }}
      >
        {report.name}
      </p>
      <span
        className="shrink-0"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          backgroundColor: "#3B82F6",
          border: "2px solid #2563EB",
          borderRadius: nbTokens.radiusBadge,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 5,
          paddingBottom: 5,
          boxShadow: `${nbTokens.shadowBadge}px ${nbTokens.shadowBadge}px 0px #1E40AF`,
        }}
      >
        <span style={{ width: 6, height: 6, backgroundColor: "#fff", borderRadius: "50%" }} />
        <span
          style={{
            fontFamily: `'${fonts.family}', sans-serif`,
            fontWeight: 700,
            fontSize: 11,
            color: "#fff",
            letterSpacing: "0.2px",
          }}
        >
          {t("home.inProgress")}
        </span>
      </span>
    </div>

    <div
      className="flex items-center gap-4 px-5 pb-5 pt-4"
      style={{ borderTop: `2px solid ${BORDER}` }}
    >
      <img
        src={reportIcon}
        alt=""
        className="w-16 h-16 object-contain shrink-0 select-none"
        style={{ opacity: 0.85 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" style={{ color: `${DARK}50` }} />
          <span className="font-space-semibold text-dark" style={{ fontSize: 13 }}>
            {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })}
            {" – "}
            {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </span>
        </div>
        {report.type && (
          <p className="font-space text-dark/30 mt-1" style={{ fontSize: 12 }}>
            {report.type}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span
          className="font-space-bold text-dark"
          style={{ fontSize: 30, letterSpacing: "-0.8px", lineHeight: 1 }}
        >
          {(report.requested_amount ?? 0).toLocaleString()}
        </span>{" "}
        <span className="font-space-bold" style={{ fontSize: 15, color: `${DARK}55` }}>
          {report.currency}
        </span>
      </div>
    </div>
  </>
  );
};

export const ReportCard = memo(({
  report,
  onClick,
  dateLocale,
  onUpload,
  uploadLabel,
}: ReportCardProps) => {
  if (onUpload) {
    return (
      <PixelCard className="w-full">
        <div
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="cursor-pointer"
        >
          <CardBody report={report} dateLocale={dateLocale} />
        </div>
        <div className="px-5 pb-5">
          <PixelCard
            bg="#3B82F6"
            borderColor="#2563EB"
            shadowColor="#1E40AF"
            shadowOffset={3}
            onClick={onUpload}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-3 px-5 py-3.5 relative z-10">
              <Camera className="w-5 h-5 text-white" />
              <span
                className="flex-1 font-space-bold text-white uppercase tracking-wider text-center"
                style={{ fontSize: 13, letterSpacing: "0.5px" }}
              >
                {uploadLabel}
              </span>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
          </PixelCard>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard onClick={onClick} className="w-full">
      <CardBody report={report} dateLocale={dateLocale} />
    </PixelCard>
  );
});
