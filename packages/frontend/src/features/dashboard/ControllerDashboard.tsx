import { useMemo } from "react";
import { Timer, BarChart3, TrendingUp, Check, X, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useReportsQuery, useUserQuery } from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import type { IReport } from "@ticket-registrator/shared";

// ─── Pending Card ─────────────────────────────────────────────────────────────

const PendingCard = ({ reports }: { reports: IReport[] }) => {
  const { t } = useTranslation();
  const hasItems = reports.length > 0;

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-lg border h-full ${
        hasItems ? "bg-amber-50 border-amber-100" : "bg-[var(--color-surface-card)] border-[var(--color-border-main)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-sans-semibold uppercase tracking-wide ${
            hasItems ? "text-amber-700" : "text-dark/50"
          }`}
        >
          {t("dashboard.pendingReview")}
        </p>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            hasItems
              ? "bg-amber-100 text-amber-700"
              : "bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/30"
          }`}
        >
          <Timer className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-[32px] font-sans-bold leading-none tracking-tight ${
            hasItems ? "text-amber-700" : "text-dark/30"
          }`}
        >
          {reports.length}
        </span>
        {hasItems && (
          <span className="text-[12px] font-sans-medium text-dark/45">
            {t("dashboard.report", { count: reports.length })}
          </span>
        )}
      </div>

      <p
        className={`text-[12px] font-sans-medium ${
          hasItems ? "text-amber-700/70" : "text-dark/40"
        }`}
      >
        {hasItems ? t("home.requiresReview") : t("dashboard.allCaughtUp")}
      </p>
    </div>
  );
};

// ─── Processed Card ───────────────────────────────────────────────────────────

const ProcessedCard = ({ total, approved, rejected }: { total: number; approved: number; rejected: number }) => {
  const { t } = useTranslation();
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const approvedPct = total > 0 ? (approved / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 p-5 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-sans-semibold uppercase tracking-wide text-dark/50">
          {t("dashboard.totalProcessed")}
        </p>
        <div className="w-7 h-7 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/45 shrink-0">
          <BarChart3 className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[32px] font-sans-bold text-dark leading-none tracking-tight">
          {total}
        </span>
        {total > 0 && (
          <span className="text-[12px] font-sans-medium text-dark/45">
            {t("dashboard.report", { count: total })}
          </span>
        )}
      </div>

      <p className="text-[12px] font-sans-medium text-dark/45">
        {total === 0
          ? t("dashboard.noActivityYet")
          : t("dashboard.approvalRate", { rate: approvalRate })}
      </p>

      <div className="flex flex-col gap-2 pt-1">
        <div className="h-1.5 rounded-full bg-dark/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-700"
            style={{ width: `${approvedPct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] font-sans-medium text-dark/55">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3 h-3 text-success" strokeWidth={2.5} aria-hidden={true} />
            {approved} {t("status.APPROVED").toLowerCase()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <X className="w-3 h-3 text-danger" strokeWidth={2.5} aria-hidden={true} />
            {rejected} {t("status.REJECTED").toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Recently Processed ───────────────────────────────────────────────────────

const RecentlyProcessed = ({
  reports,
  navigate,
  dateLocale,
}: {
  reports: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
}) => {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-3" data-testid="recently-processed">
      <p className="text-[11px] font-sans-semibold text-dark/45">
        {t("dashboard.recentlyProcessed")}
      </p>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2 text-center rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <TrendingUp className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="text-[13px] font-sans-medium text-dark/55">
            {t("dashboard.noActivityYet")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="group w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors"
            >
              <StatusBadge status={report.status} />
              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                  {report.name}
                </p>
                <p className="text-[12px] font-sans-medium text-dark/50 mt-0.5 leading-none">
                  {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
              {report.requested_amount > 0 && (
                <span className="text-[14px] font-sans-bold text-dark tabular-nums shrink-0">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[11px] font-sans-medium text-dark/45 ml-1">
                    {report.currency}
                  </span>
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

// ─── ControllerDashboard ──────────────────────────────────────────────────────

export const ControllerDashboard = () => {
  const { t, getGreetingKey, dateLocale } = useDashboardHelpers();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading } = useReportsQuery();

  const all = reports ?? [];

  const pending = useMemo(
    () => all.filter((r) => r.status.toUpperCase() === "SUBMITTED"),
    [all],
  );

  const approved = useMemo(
    () => all.filter((r) => r.status.toUpperCase() === "APPROVED"),
    [all],
  );

  const rejected = useMemo(
    () => all.filter((r) => ["DECLINED", "REJECTED"].includes(r.status.toUpperCase())),
    [all],
  );

  const recentProcessed = useMemo(
    () =>
      all
        .filter((r) => ["APPROVED", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()))
        .slice(0, 6),
    [all],
  );

  const firstName = user?.name?.split(" ")[0] || t("layout.defaultUser");

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHero
        user={user}
        t={t}
        greetingKey={getGreetingKey()}
        firstName={firstName}
        subtitle={t("dashboard.subtitleController")}
        subtitleIcon={<BarChart3 className="w-3.5 h-3.5" aria-hidden={true} />}
      />

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
        data-testid="controller-stats"
      >
        <PendingCard reports={pending} />
        <ProcessedCard
          total={approved.length + rejected.length}
          approved={approved.length}
          rejected={rejected.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <PendingApprovalsList
            reports={pending}
            navigate={navigate}
            dateLocale={dateLocale}
            t={t}
            title={t("dashboard.approvalQueue")}
            viewAllPath="/reports?status=SUBMITTED"
            maxItems={8}
          />
        </div>
        <RecentlyProcessed
          reports={recentProcessed}
          navigate={navigate}
          dateLocale={dateLocale}
        />
      </div>
    </div>
  );
};
