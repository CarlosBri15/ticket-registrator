import { useMemo } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  useReportsQuery,
  useUserQuery,
} from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { format, isThisWeek } from "date-fns";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingStatsCard } from "./components/PendingStatsCard";
import { WeeklyStatsCard, PendingAmountCard } from "./components/ControllerStatsCards";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { tokens, radius } from "../../styles/design-tokens";

const RecentlyProcessed = ({ recentProcessed, navigate, dateLocale }: any) => (
  <section className="space-y-4" data-testid="recently-processed">
    <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
      <div className={`w-6 h-6 bg-slate-100 ${radius.base} flex items-center justify-center`}>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
      </div>
      Procesados recientemente
    </h2>

    <div className={tokens.listSection}>
      {recentProcessed.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-400 font-medium">Sin reportes procesados aún</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {recentProcessed.map((report: any) => (
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
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-semibold text-dark text-sm">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-medium text-slate-400 ml-0.5">{report.currency}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
);

export const ControllerDashboard = () => {
  const { t, getGreetingKey, dateLocale } = useDashboardHelpers();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading } = useReportsQuery();

  const filteredReports = reports ?? [];
  const pending = useMemo(
    () => filteredReports.filter((r) => r.status.toUpperCase() === "SUBMITTED"),
    [filteredReports],
  );

  const approvedThisWeek = useMemo(
    () =>
      filteredReports.filter((r) => {
        const d = new Date(r.updatedAt);
        return r.status.toUpperCase() === "APPROVED" && isThisWeek(d);
      }),
    [filteredReports],
  );

  const declinedThisWeek = useMemo(
    () =>
      filteredReports.filter((r) => {
        const d = new Date(r.updatedAt);
        const status = r.status.toUpperCase();
        return (
          (status === "DECLINED" || status === "REJECTED") && isThisWeek(d)
        );
      }),
    [filteredReports],
  );

  const pendingAmount = useMemo(
    () => pending.reduce((acc, r) => acc + r.requested_amount, 0),
    [pending],
  );

  const recentProcessed = useMemo(
    () =>
      filteredReports
        .filter((r) =>
          ["APPROVED", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()),
        )
        .slice(0, 5),
    [filteredReports],
  );

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <DashboardHero
        user={user}
        t={t}
        greetingKey={getGreetingKey()}
        firstName={firstName}
        subtitle="Panel de Control · Aprobaciones"
        subtitleIcon={<Shield className="w-3.5 h-3.5" />}
        avatarBgColor="bg-warning"
        badgeColorClass="text-warning/70 bg-warning/10"
        actions={
          <Button
            variant="ghost-white"
            className="w-auto"
            onClick={() => navigate("/reports")}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Ver todos los viajes
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="controller-stats">
        <PendingStatsCard count={pending.length} label="Pendientes" dataTestId="pending-count" />
        <WeeklyStatsCard
          title="Aprobados esta semana"
          count={approvedThisWeek.length}
          icon={<CheckCircle className="w-4 h-4" />}
          colorClass="green"
          subtitle="Aprobados en 7 días"
        />
        <WeeklyStatsCard
          title="Rechazados esta semana"
          count={declinedThisWeek.length}
          icon={<XCircle className="w-4 h-4" />}
          colorClass="red"
          subtitle={declinedThisWeek.length > 0 ? "Requieren atención" : "Sin rechazos"}
        />
        <PendingAmountCard amount={pendingAmount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          recentProcessed={recentProcessed}
          navigate={navigate}
          dateLocale={dateLocale}
        />
      </div>
    </div>
  );
};
