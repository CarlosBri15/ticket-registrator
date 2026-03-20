import { useTicketsQuery } from "@ticket-registrator/shared";
import type { IReport } from "@ticket-registrator/shared";
import { ArrowUpRight, Calendar, Receipt } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";

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
      onClick={() => navigate(`/trips/${currentTrip.id}`)}
      className="w-full text-left relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/10 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-60 h-60 bg-brand/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={currentTrip.status} size="md" />
            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase font-mono">
              #{currentTrip.id.substring(0, 8)}
            </span>
          </div>
          <div className="w-10 h-10 bg-brand/5 rounded-2xl flex items-center justify-center group-hover:bg-brand transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-dark tracking-tight group-hover:text-brand transition-colors duration-300 leading-tight">
            {currentTrip.name}
          </h3>
          <p className="text-gray-400 font-medium flex items-center gap-2 mt-2 text-sm">
            <Calendar className="w-4 h-4 text-brand/50" />
            {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} —{" "}
            {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        <div className="flex items-end justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
            <Receipt className="w-4 h-4 text-brand/60" />
            <span className="text-sm font-black text-dark">{ticketCount}</span>
            <span className="text-xs text-gray-400 font-medium">{t("home.processedTickets")}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              {t("home.currentExpense")}
            </p>
            <p className="text-3xl font-black text-brand tracking-tighter leading-none">
              {totalAmount > 0 ? totalAmount.toFixed(2) : currentTrip.requested_amount}
              <span className="text-base font-bold text-brand/50 ml-1">{currentTrip.currency}</span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};
