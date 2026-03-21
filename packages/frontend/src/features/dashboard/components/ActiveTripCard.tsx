import { useTicketsQuery } from "@ticket-registrator/shared";
import type { IReport } from "@ticket-registrator/shared";
import { ArrowUpRight, Calendar, Receipt } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { tokens, radius } from "../../../styles/design-tokens";

export const ActiveTripCard = ({
  currentTrip,
  navigate,
  dateLocale,
  t,
}: {
  currentTrip: IReport;
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  const { data: tickets } = useTicketsQuery(currentTrip.id);
  const ticketCount = tickets?.length ?? 0;
  const totalAmount = tickets?.reduce((acc: number, tk: any) => acc + (tk.amount || 0), 0) ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/reports/${currentTrip.id}`)}
      className={`w-full text-left relative bg-white ${radius.card} p-6 shadow-sm border border-brand/10 overflow-hidden group cursor-pointer hover:shadow-md hover:border-brand/20 transition-all duration-200`}
    >
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={currentTrip.status} size="md" />
            <span className="text-[10px] font-medium text-slate-300 tracking-wider uppercase font-mono">
              #{currentTrip.id.substring(0, 8)}
            </span>
          </div>
          <div className={`w-9 h-9 bg-brand/5 ${radius.base} flex items-center justify-center group-hover:bg-brand transition-all duration-200`}>
            <ArrowUpRight className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-dark tracking-tight group-hover:text-brand transition-colors duration-200 leading-tight">
            {currentTrip.name}
          </h3>
          <p className="text-slate-400 font-medium flex items-center gap-2 mt-1.5 text-sm">
            <Calendar className="w-3.5 h-3.5 text-brand/50" />
            {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} —{" "}
            {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-slate-100">
          <div className={`flex items-center gap-2 bg-slate-50 px-3.5 py-2 ${radius.base} border border-slate-200`}>
            <Receipt className="w-3.5 h-3.5 text-brand/60" />
            <span className="text-sm font-semibold text-dark">{ticketCount}</span>
            <span className="text-xs text-slate-400 font-medium">{t("home.processedTickets")}</span>
          </div>
          <div className="text-right">
            <p className={tokens.statCardLabel + " mb-0.5"}>
              {t("home.currentExpense")}
            </p>
            <p className="text-2xl font-bold text-brand tracking-tight leading-none">
              {totalAmount > 0 ? totalAmount.toFixed(2) : currentTrip.requested_amount}
              <span className="text-sm font-medium text-brand/50 ml-1">{currentTrip.currency}</span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};
