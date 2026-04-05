/**
 * ReportCard — Hero card for the active/current report.
 * Same horizontal layout as ReportRow but larger and with upload button support.
 */
import { memo } from "react";
import { Calendar, Camera, ChevronRight } from "lucide-react";
import { format, type Locale } from "date-fns";
import { fonts, type IReport } from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { reportIcon } from "@ticket-registrator/shared/assets";
import { PixelCard } from "../../../components/ui/PixelCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DARK, BRAND } from "../constants";

interface ReportCardProps {
  report: IReport;
  onClick: () => void;
  dateLocale: Locale;
  onUpload?: () => void;
  uploadLabel?: string;
}

export const ReportCard = memo(({
  report,
  onClick,
  dateLocale,
  onUpload,
  uploadLabel,
}: ReportCardProps) => {
  const { t } = useTranslation();

  return (
    <PixelCard onClick={onUpload ? undefined : onClick} shadowOffset={4} className="w-full">
      <div
        className="flex items-center gap-4 px-5 py-4"
        onClick={onUpload ? () => onClick() : undefined}
        style={{ cursor: onUpload ? 'pointer' : undefined }}
      >

        {/* Icon */}
        <img
          src={reportIcon}
          alt=""
          className="w-11 h-11 object-contain shrink-0 select-none"
        />

        {/* Nombre */}
        <div className="flex-[2] min-w-0">
          <p className="font-space-bold text-dark truncate" style={{ fontSize: 16 }}>
            {report.name}
          </p>
        </div>

        {/* Estado */}
        <div className="shrink-0 w-32 flex justify-center">
          <StatusBadge status={report.status} size="md" />
        </div>

        {/* Fecha */}
        <div className="shrink-0 w-40 flex justify-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}40` }} />
            <p className="font-space-semibold tabular-nums whitespace-nowrap" style={{ fontSize: 13, color: `${DARK}70` }}>
              {format(new Date(report.start_date ?? report.end_date), "dd MMM", { locale: dateLocale })}
              {report.end_date && report.end_date !== report.start_date &&
                ` – ${format(new Date(report.end_date), "dd MMM yy", { locale: dateLocale })}`}
            </p>
          </div>
        </div>

        {/* Dinero + moneda */}
        <div className="shrink-0 w-28 flex justify-end">
          <p className="font-space-bold text-dark tabular-nums leading-none" style={{ fontSize: 17 }}>
            {(report.requested_amount ?? 0).toLocaleString()}
            {report.currency && (
              <span className="font-space-semibold ml-1" style={{ fontSize: 12, color: `${DARK}50` }}>
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
                fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 11,
                color: BRAND, backgroundColor: `${BRAND}12`,
                paddingLeft: 9, paddingRight: 9, paddingTop: 5, paddingBottom: 5,
                borderRadius: 7, border: `1.5px solid ${BRAND}25`,
              }}
            >
              {report.type}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: `${DARK}25` }}>—</span>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 shrink-0" style={{ color: `${DARK}25` }} />

      </div>

      {/* Upload button */}
      {onUpload && (
        <div className="px-5 pb-4">
          <PixelCard bg={BRAND} shadowOffset={3} onClick={onUpload} className="w-full">
            <div className="flex items-center justify-center gap-2.5 px-5 py-3">
              <Camera className="w-4 h-4 text-white" />
              <span
                className="font-space-bold text-white"
                style={{ fontSize: 13, letterSpacing: "0.3px" }}
              >
                {uploadLabel}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
          </PixelCard>
        </div>
      )}
    </PixelCard>
  );
});
