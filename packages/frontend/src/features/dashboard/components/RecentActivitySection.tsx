import { Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { tokens, radius } from "../../../styles/theme";

interface RecentActivitySectionProps {
  t: any;
  recentCompleted: any[];
  navigate: (path: string) => void;
  dateLocale: any;
}

export const RecentActivitySection = ({ t, recentCompleted, navigate, dateLocale }: RecentActivitySectionProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
          <div className={`w-6 h-6 bg-slate-100 ${radius.base} flex items-center justify-center`}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          {t("home.recentActivity")}
        </h2>
        <button
          onClick={() => navigate("/reports")}
          className="text-[10px] font-semibold text-brand uppercase tracking-wide hover:underline"
        >
          {t("common.viewAll")}
        </button>
      </div>

      <div className={tokens.listSection}>
        {recentCompleted.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400 font-medium">{t("trips.noCompletedTrips")}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentCompleted.map((report: any) => (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/reports/${report.id}`)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status={report.status} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-dark text-sm truncate group-hover:text-brand transition-colors">
                      {report.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">
                      {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
