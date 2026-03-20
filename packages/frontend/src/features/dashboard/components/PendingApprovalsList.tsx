import type { IReport } from "@ticket-registrator/shared";
import { CheckCircle, Calendar, ChevronRight } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";

export const PendingApprovalsList = ({
  reports,
  navigate,
  dateLocale,
  t,
}: {
  reports: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-gray-400 font-semibold max-w-xs leading-relaxed">
          {t("home.noPendingApprovals")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {reports.slice(0, 6).map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => navigate(`/trips/${report.id}`)}
            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center font-black text-sm text-brand shrink-0">
                {report.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                  {report.name}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="font-black text-dark text-sm">
                {report.requested_amount.toFixed(2)}
                <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
              </span>
              <StatusBadge status={report.status} size="sm" />
              <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
      {reports.length > 6 && (
        <div className="p-4 border-t border-gray-50 text-center">
          <button
            onClick={() => navigate("/trips")}
            className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
          >
            {t("common.viewAll")} ({reports.length})
          </button>
        </div>
      )}
    </div>
  );
};
