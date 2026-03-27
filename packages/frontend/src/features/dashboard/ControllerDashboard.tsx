import { useMemo } from "react";
import { Timer, BarChart3, TrendingUp, Check, X } from "lucide-react";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useReportsQuery, useUserQuery } from "@ticket-registrator/shared";
import { dashboardIcon } from "@ticket-registrator/shared/assets";

import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import type { IReport } from "@ticket-registrator/shared";

// ─── Pending Card ─────────────────────────────────────────────────────────────

const PendingCard = ({ reports }: { reports: IReport[] }) => {
  const hasItems = reports.length > 0;

  return (
    <div className="bg-white rounded-2xl h-full" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">Pendientes de revisión</p>
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
            <span className="text-sm text-slate-400">{reports.length === 1 ? "reporte" : "reportes"}</span>
          )}
        </div>
        <p className="text-sm" style={{ color: hasItems ? "#f97316" : "#cbd5e1" }}>
          {hasItems ? "esperando tu revisión" : "Todo al día · Sin pendientes"}
        </p>
      </div>

    </div>
  );
};

// ─── Processed Card ───────────────────────────────────────────────────────────

const ProcessedCard = ({ total, approved, rejected }: { total: number; approved: number; rejected: number }) => {
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const approvedPct = total > 0 ? (approved / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl h-full" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">Total procesados</p>
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
          {total > 0 && <span className="text-sm text-slate-400">{total === 1 ? "reporte" : "reportes"}</span>}
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {total === 0 ? "Sin actividad aún" : `${approvalRate}% tasa de aprobación`}
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
              {approved} aprobados
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <div className="w-5 h-5 rounded-md bg-danger/10 flex items-center justify-center">
                <X className="w-3 h-3 text-danger" strokeWidth={2.5} />
              </div>
              {rejected} rechazados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Recently Processed ───────────────────────────────────────────────────────

const RecentlyProcessed = ({ reports, navigate, dateLocale }: any) => (
  <section className="space-y-3" data-testid="recently-processed">
    <p className="text-sm font-medium text-slate-500 px-1">Procesados recientemente</p>

    <div className="bg-white rounded-2xl" style={{ border: "1px solid #edf0f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)" }}>
      {reports.length === 0 ? (
        <div className="p-10 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">Sin actividad aún</p>
        </div>
      ) : (
        <div>
          {reports.map((report: any, idx: number) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group"
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
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
);

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

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10">

      <DashboardHero
        user={user}
        t={t}
        greetingKey={getGreetingKey()}
        firstName={firstName}
        subtitle="Panel de Control · Aprobaciones"
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
            title="Cola de aprobación"
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
