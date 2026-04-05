import { reportIcon } from "@ticket-registrator/shared/assets";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { IReport } from "@ticket-registrator/shared";
import { PixelCard } from "../../../components/ui/PixelCard";
import { Calendar } from "lucide-react";

export const ActiveTripCard = ({
  currentTrip,
  navigate,
  dateLocale,
}: {
  currentTrip: IReport;
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  return (
    <PixelCard
      shadowOffset={6}
      onClick={() => navigate(`/reports/${currentTrip.id}`)}
      className="w-full"
    >
      {/* Top: name + "En curso" pill */}
      <div className="flex items-start justify-between gap-3 pt-4 px-4 mb-5">
        <h3 className="flex-1 font-space-bold text-[22px] text-dark leading-tight tracking-tight">
          {currentTrip.name}
        </h3>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-brand text-white font-space-bold text-[9px] border-2 border-border-main rounded-lg px-2.5 py-1 shadow-hard-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          En curso
        </span>
      </div>

      {/* Footer: icon + dates + amount */}
      <div
        className="flex items-center gap-3 px-4 pb-4 pt-3.5"
        style={{ borderTop: "2px solid rgba(26,26,26,0.07)" }}
      >
        <img
          src={reportIcon}
          alt=""
          className="w-14 h-14 shrink-0 object-contain opacity-85"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-dark shrink-0" />
            <span className="font-space-semibold text-[10px] text-dark tracking-wide">
              {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })}
              {" – "}
              {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-space-bold text-[24px] text-dark leading-none tracking-tight">
            {(currentTrip.requested_amount ?? 0).toLocaleString()}
          </span>
          <span className="font-space-bold text-[13px] ml-1" style={{ color: "rgba(26,26,26,0.55)" }}>
            {currentTrip.currency}
          </span>
        </div>
      </div>
    </PixelCard>
  );
};
