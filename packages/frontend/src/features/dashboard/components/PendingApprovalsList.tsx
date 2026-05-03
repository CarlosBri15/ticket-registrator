import type { IReport } from "@ticket-registrator/shared";
import { ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { TFunction } from "i18next";

export interface PendingApprovalsListProps {
  reports: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: TFunction;
  title?: string;
  maxItems?: number;
  viewAllPath?: string;
}

export const PendingApprovalsList = ({
  reports,
  navigate,
  dateLocale,
  t,
  title,
  maxItems = 6,
  viewAllPath = "/reports",
}: PendingApprovalsListProps) => {
  const isEmpty = reports.length === 0;
  const heading = title ?? t("home.pendingApprovals");

  return (
    <section className="flex flex-col gap-3" data-testid="approval-queue">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-sans-semibold text-dark/45">{heading}</p>
          {!isEmpty && (
            <span className="text-[11px] font-sans-bold text-dark/25 tabular-nums">
              {reports.length}
            </span>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12 text-center rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]"
          data-testid="empty-queue"
        >
          <CheckCircle2 className="w-4 h-4 text-success" aria-hidden={true} />
          <p className="text-[13px] font-sans-medium text-dark/55">
            {t("home.noPendingApprovals")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {reports.slice(0, maxItems).map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="group w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white shrink-0">
                <FileText className="w-3.5 h-3.5" aria-hidden={true} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                  {report.name}
                </p>
                <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 leading-none">
                  {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {report.requested_amount > 0 && (
                  <div className="text-right">
                    <p className="text-[14px] font-sans-bold text-dark leading-none tabular-nums">
                      {report.requested_amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-sans-medium text-dark/45 mt-0.5 uppercase tracking-wide">
                      {report.currency}
                    </p>
                  </div>
                )}
                <StatusBadge status={report.status} />
                <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}

          {reports.length > maxItems && (
            <div className="px-4 py-3 border-t border-[var(--color-border-main)]">
              <button
                type="button"
                onClick={() => navigate(viewAllPath)}
                className="text-[12px] font-sans-medium text-dark/50 hover:text-dark underline underline-offset-2 transition-colors"
              >
                {t("common.viewAll", "Ver todos")} ({reports.length})
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
