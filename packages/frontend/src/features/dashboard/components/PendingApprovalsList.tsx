import type { IReport } from "@ticket-registrator/shared";
import { CheckCircle, Calendar, ArrowRight, Clock } from "lucide-react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";

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
  const isEmpty = reports.length === 0;

  return (
    <section className="space-y-3" data-testid="approval-queue">
      <SectionHeader
        icon={<Clock />}
        title={title}
        count={!isEmpty ? reports.length : undefined}
      />

      {isEmpty ? (
        <div
          className="rounded-lg border border-dashed border-slate-200 bg-white p-10 flex flex-col items-center justify-center text-center min-h-[220px]"
          data-testid="empty-queue"
        >
          <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-400">{t("home.noPendingApprovals")}</p>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg"
          style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}
        >
          <div>
            {reports.slice(0, maxItems).map((report, idx) => (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/reports/${report.id}`)}
                className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors group"
                style={{ borderBottom: idx < Math.min(reports.length, maxItems) - 1 ? "1px solid #f8fafc" : "none" }}
              >
                {/* Amber status dot */}
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {report.requested_amount > 0 && (
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900 tabular-nums leading-none">
                        {report.requested_amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">
                        {report.currency}
                      </p>
                    </div>
                  )}
                  <StatusBadge status={report.status} size="sm" />
                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-brand bg-brand/8 px-3 py-1.5 rounded-full group-hover:bg-brand group-hover:text-white transition-all whitespace-nowrap">
                    Revisar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {reports.length > maxItems && (
            <div className="px-5 py-3.5 border-t border-slate-100">
              <button
                onClick={() => navigate(viewAllPath)}
                className="text-[11px] font-bold text-brand hover:text-brand-hover transition-colors"
              >
                Ver todos ({reports.length})
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
