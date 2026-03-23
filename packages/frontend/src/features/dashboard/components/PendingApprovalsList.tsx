import type { IReport } from "@ticket-registrator/shared";
import { CheckCircle, Calendar, ChevronRight, Clock } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { tokens, radius } from "../../../styles/theme";

export interface PendingApprovalsListProps {
  reports: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
  title?: string;
  maxItems?: number;
  viewAllPath?: string;
}

export const PendingApprovalsList = ({
  reports,
  navigate,
  dateLocale,
  t,
  title = "Aprobaciones pendientes",
  maxItems = 6,
  viewAllPath = "/reports",
}: PendingApprovalsListProps) => {
  if (reports.length === 0) {
    return (
      <section className="space-y-4" data-testid="approval-queue">
        <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
          <div className={`w-6 h-6 bg-slate-100 ${radius.base} flex items-center justify-center`}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          {title}
        </h2>
        <div className={`${tokens.emptyState} min-h-[240px]`} data-testid="empty-queue">
          <div className={tokens.emptyStateIcon}>
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <p className={tokens.emptyStateText}>
            {t("home.noPendingApprovals")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" data-testid="approval-queue">
      <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
        <div className={`w-6 h-6 bg-warning/10 ${radius.base} flex items-center justify-center`}>
          <Clock className="w-3.5 h-3.5 text-warning" />
        </div>
        {title}
        <span className={`${tokens.badgeSm} ${tokens.badgeWarning}`}>
          {reports.length}
        </span>
      </h2>

      <div className={tokens.listSection}>
        <div className="divide-y divide-slate-50">
          {reports.slice(0, maxItems).map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 bg-brand/5 ${radius.base} flex items-center justify-center font-semibold text-sm text-brand shrink-0`}>
                  {report.name?.charAt(0).toUpperCase() || "R"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-dark text-sm truncate group-hover:text-warning transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="font-semibold text-dark text-sm">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-medium text-slate-400 ml-0.5">{report.currency}</span>
                </span>
                <StatusBadge status={report.status} size="sm" />
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-warning group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
        {reports.length > maxItems && (
          <div className="p-4 border-t border-slate-50 text-center">
            <button
              onClick={() => navigate(viewAllPath)}
              className="text-[10px] font-semibold text-brand uppercase tracking-wide hover:underline"
            >
              {t("common.viewAll")} ({reports.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
