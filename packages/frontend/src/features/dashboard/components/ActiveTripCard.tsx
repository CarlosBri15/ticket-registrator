import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { IReport } from "@ticket-registrator/shared";
import { Calendar, FileText } from "lucide-react";

export const ActiveTripCard = ({
  currentTrip,
  navigate,
  dateLocale,
  t,
}: {
  currentTrip: IReport;
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) => {
  return (
    <button
      type="button"
      onClick={() => navigate(`/reports/${currentTrip.id}`)}
      className="group w-full text-left rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary)] transition-colors duration-100 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <h3 className="flex-1 font-sans-bold text-[22px] text-dark leading-tight tracking-tight">
          {currentTrip.name}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-1.5 bg-brand text-white text-[10px] font-sans-semibold rounded-md px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {t("home.inProgress", "En curso")}
        </span>
      </div>

      <div className="flex items-center gap-3 px-5 py-3.5 border-t border-[var(--color-border-main)]">
        <div className="w-10 h-10 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
          <FileText className="w-4 h-4" aria-hidden={true} />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-dark/40 shrink-0" aria-hidden={true} />
          <span className="font-sans-medium text-[12px] text-dark/60">
            {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })}
            {" – "}
            {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="font-sans-bold text-[20px] text-dark leading-none tabular-nums">
            {(currentTrip.requested_amount ?? 0).toLocaleString()}
          </span>
          <span className="font-sans-medium text-[12px] text-dark/50 ml-1">
            {currentTrip.currency}
          </span>
        </div>
      </div>
    </button>
  );
};
