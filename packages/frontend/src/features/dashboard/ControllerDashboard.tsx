import { useMemo } from "react";
import { Timer, BarChart3, TrendingUp, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useReportsQuery, useUserQuery } from "@ticket-registrator/shared";
import { dashboardIcon } from "@ticket-registrator/shared/assets";
import { Button } from "../../components/ui/Button";

import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { tokens } from "../../styles/theme";
import { userIcon } from "@ticket-registrator/shared/assets";
import type { IReport } from "@ticket-registrator/shared";

// ─── Pending Card ─────────────────────────────────────────────────────────────

const PendingCard = ({ reports }: { reports: IReport[] }) => {
  const { t } = useTranslation();
  const hasItems = reports.length > 0;

  return (
    <div className="bg-white rounded-lg h-full" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{t("dashboard.pendingReview")}</p>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: hasItems ? "#fff7ed" : "#f8fafc", border: `1px solid ${hasItems ? "#fed7aa" : "#e2e8f0"}` }}
          >
            <Timer className="w-4 h-4" style={{ color: hasItems ? "#f97316" : "#cbd5e1" }} />
          </div>
        </div>

        {/* Metric */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold tracking-tight" style={{ color: hasItems ? "#0f172a" : "#e2e8f0" }}>
            {reports.length}
          </span>
          {hasItems && (
            <span className="text-sm text-slate-400">{t("dashboard.report", { count: reports.length })}</span>
          )}
        </div>
        <p className="text-sm" style={{ color: hasItems ? "#f97316" : "#cbd5e1" }}>
          {hasItems ? t("home.requiresReview") : t("dashboard.allCaughtUp")}
        </p>
      </div>

    </div>
  );
};

// ─── Processed Card ───────────────────────────────────────────────────────────

const ProcessedCard = ({ total, approved, rejected }: { total: number; approved: number; rejected: number }) => {
  const { t } = useTranslation();
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const approvedPct = total > 0 ? (approved / total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg h-full" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{t("dashboard.totalProcessed")}</p>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <BarChart3 className="w-4 h-4 text-brand" />
          </div>
        </div>

        {/* Metric */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold tracking-tight text-slate-900">{total}</span>
          {total > 0 && <span className="text-sm text-slate-400">{t("dashboard.report", { count: total })}</span>}
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {total === 0 ? t("dashboard.noActivityYet") : t("dashboard.approvalRate", { rate: approvalRate })}
        </p>

        {/* Progress */}
        <div className="space-y-2.5">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{ width: `${approvedPct}%` }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <div className="w-5 h-5 rounded-md bg-success/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
              </div>
              {approved} {t("status.APPROVED").toLowerCase()}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <div className="w-5 h-5 rounded-md bg-danger/10 flex items-center justify-center">
                <X className="w-3 h-3 text-danger" strokeWidth={2.5} />
              </div>
              {rejected} {t("status.REJECTED").toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Recently Processed ───────────────────────────────────────────────────────

const RecentlyProcessed = ({ reports, navigate, dateLocale }: { reports: IReport[]; navigate: (path: string) => void; dateLocale: Locale }) => {
  const { t } = useTranslation();
  return (
  <section className="space-y-1" data-testid="recently-processed">
    <SectionHeader
      icon={<BarChart3 />}
      title={t("dashboard.recentlyProcessed")}
    />

    <div className="bg-white rounded-lg" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      {reports.length === 0 ? (
        <div className="p-10 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">{t("dashboard.noActivityYet")}</p>
        </div>
      ) : (
        <div>
          {reports.map((report, idx) => (
            <Button
              key={report.id}
              variant="ghost"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group !border-none !shadow-none !rounded-none"
              style={{ borderBottom: idx < reports.length - 1 ? "1px solid #f8fafc" : "none" }}
            >
              <StatusBadge status={report.status} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate group-hover:text-brand transition-colors">
                  {report.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
              {report.requested_amount > 0 && (
                <span className="text-sm font-semibold text-slate-700 tabular-nums shrink-0">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] text-slate-400 ml-0.5">{report.currency}</span>
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
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
    () => all
      .filter((r) => ["APPROVED", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()))
      .slice(0, 6),
    [all],
  );

  const firstName = user?.name?.split(" ")[0] || t("layout.defaultUser");

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10 -mx-6 -mt-5 md:-mx-10 lg:-mt-6">
      <div className={tokens.headerPage}>
        <span className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {firstName}
        </span>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate("/settings")}
          className="!bg-[#E8E8FF]"
        >
          <img src={userIcon} alt="avatar" className="w-10 h-10 object-contain" />
        </Button>
      </div>

      <div className="px-6 md:px-10 space-y-5">
        <DashboardHero
          user={user}
          t={t}
          greetingKey={getGreetingKey()}
          firstName={firstName}
          subtitle={t("dashboard.subtitleController")}
          subtitleIcon={<img src={dashboardIcon} alt="" className="w-4 h-4 object-contain select-none" />}
        />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch stagger-children" data-testid="controller-stats">
        <div className="animate-slide-up h-full">
          <PendingCard reports={pending} />
        </div>
        <div className="animate-slide-up h-full">
          <ProcessedCard
            total={approved.length + rejected.length}
            approved={approved.length}
            rejected={rejected.length}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
  </div>
);
};
