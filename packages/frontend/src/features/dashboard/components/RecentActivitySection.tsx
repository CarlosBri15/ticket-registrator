import { Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "../../../components/ui/StatusBadge";

interface RecentActivitySectionProps {
  t: any;
  recentCompleted: any[];
  navigate: (path: string) => void;
  dateLocale: any;
}

export const RecentActivitySection = ({ t, recentCompleted, navigate, dateLocale }: RecentActivitySectionProps) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {t("home.recentActivity")}
        </h2>
        <button
          onClick={() => navigate("/trips")}
          className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline underline-offset-2"
        >
          {t("common.viewAll")}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {recentCompleted.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-400 font-medium">{t("trips.noCompletedTrips")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCompleted.map((report: any) => (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/trips/${report.id}`)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status={report.status} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                      {report.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
