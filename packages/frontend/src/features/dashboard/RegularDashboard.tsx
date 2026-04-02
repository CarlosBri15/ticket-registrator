import { useMemo } from "react";
import {
  Wallet,
  Plane,
  Plus,
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import {
  useReportsQuery,
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScope,
  useScopeContext,
  usePermissions,
} from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { getReportsSummary, getAmountsSummary } from "./utils";
import { CompanyModeBanner } from "./components/CompanyModeBanner";
import { ActiveTripCard } from "./components/ActiveTripCard";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { QuickActionsGrid } from "./components/QuickActionsGrid";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingStatsCard } from "./components/PendingStatsCard";
import { RecentActivitySection } from "./components/RecentActivitySection";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { tokens, radius, text } from "../../styles/theme";

const TeamKpis = ({ teamMemberCount, pendingCount, t }: { teamMemberCount: number; pendingCount: number; t: any }) => (
  <>
    <StatCard title={t("home.teamMembers")} value={teamMemberCount.toString()} icon={<Users className="w-4 h-4" />} subtitle={t("home.activeMembers")} />
    <PendingStatsCard count={pendingCount} label={t("home.pendingApprovals")} />
  </>
);

const UserKpis = ({ activeCount, rejectedCount, t }: { activeCount: number; rejectedCount: number; t: any }) => (
  <>
    <StatCard title={t("home.activeTrips")} value={activeCount.toString()} icon={<Plane className="w-4 h-4" />} subtitle={t("home.activeTripsSubtitle")} />
    <StatCard
      title={t("home.rejectedItems")}
      value={rejectedCount.toString()}
      icon={<TrendingUp className="w-4 h-4" />}
      subtitle={rejectedCount > 0 ? t("home.requiresAttention") : t("home.noIncidents")}
      variant={rejectedCount > 0 ? "primary" : "default"}
    />
  </>
);

const KpisGrid = ({
  amounts, reportsByStatus, showTeamStats, teamMemberCount, t,
}: {
  amounts: any; reportsByStatus: any; showTeamStats: boolean; teamMemberCount: number; t: any;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      variant="primary"
      title={t("home.pendingReimbursement")}
      value={`${amounts.pending.toFixed(2)} €`}
      icon={<Wallet className="w-4 h-4" />}
      trend={amounts.pending > 0 ? t("home.inProcess") : t("home.upToDate")}
      trendUp={false}
    />
    {showTeamStats ? (
      <TeamKpis teamMemberCount={teamMemberCount} pendingCount={reportsByStatus.pending.length} t={t} />
    ) : (
      <UserKpis activeCount={reportsByStatus.active.length} rejectedCount={amounts.rejectedCount} t={t} />
    )}
  </div>
);

const MainGridTitle = ({ showTeamStats, canApprove, t }: any) => {
  if (showTeamStats) {
    return canApprove ? t("home.pendingApprovals") : t("home.teamReports");
  }
  return t("home.activeTrip");
};

export const RegularDashboard = () => {
  const { t, i18n, getGreetingKey, dateLocale } = useDashboardHelpers();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading: reportsLoading } = useReportsQuery();
  const { data: users } = useUsersQuery();
  const { data: orgs } = useOrganizationsQuery();
  const { isSelf, isGlobal } = useScope();
  const { can } = usePermissions();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();

  const data = useMemo(() => {
    if (!Array.isArray(reports)) return null;
    return {
      reportsByStatus: getReportsSummary(reports),
      amounts: getAmountsSummary(reports),
      currentTrip: getReportsSummary(reports).active.find((r: any) => r.status.toUpperCase() !== "SUBMITTED") || null,
      teamMemberCount: users?.length ?? 0,
    };
  }, [reports, users]);

  const dashboardMainContent = useMemo(() => {
    if (!data) return null;
    const { reportsByStatus, currentTrip } = data;
    const canApprove = can("approve_reports");
    const showTeamStats = !isSelf;

    if (showTeamStats) {
      return (
        <PendingApprovalsList
          reports={canApprove ? reportsByStatus.pending : reportsByStatus.active}
          navigate={navigate}
          dateLocale={dateLocale}
          t={t}
          title={MainGridTitle({ showTeamStats, canApprove, t })}
        />
      );
    }

    if (currentTrip) {
      return (
        <div className="space-y-4">
          <h2 className={`${text.subheading} flex items-center gap-2.5`}>
            <div className={`w-6 h-6 bg-brand/10 ${radius.base} flex items-center justify-center`}>
              <TrendingUp className="w-3.5 h-3.5 text-brand" />
            </div>
            {t("home.activeTrip")}
          </h2>
          <ActiveTripCard currentTrip={currentTrip} navigate={navigate} dateLocale={dateLocale} t={t} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
          <div className={`w-6 h-6 bg-brand/10 ${radius.base} flex items-center justify-center`}>
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
          </div>
          {t("home.activeTrip")}
        </h2>
        <div className={`${tokens.emptyState} min-h-[240px]`}>
          <div className={tokens.emptyStateIcon}>
            <Plane className="w-7 h-7 text-slate-300" />
          </div>
          <p className={tokens.emptyStateText}>{t("trips.noActiveTrips")}</p>
          <Button variant="secondary" className="w-auto mt-4" onClick={() => navigate("/reports")}>
            <Plus className="w-4 h-4 mr-1.5" /> {t("home.createFirst")}
          </Button>
        </div>
      </div>
    );
  }, [data, isSelf, can, navigate, dateLocale, t]);

  if (reportsLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { reportsByStatus, amounts, teamMemberCount } = data;
  const firstName = user?.name?.split(" ")[0] || "Usuario";
  const showTeamStats = !isSelf;
  const showManagementLinks = can("view_users") || can("view_departments") || can("view_roles");

  const isCompanyMode = isGlobal && !!activeCompanyId;
  const activeOrg = orgs?.find((o) => o.id === activeCompanyId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {isCompanyMode && (
        <CompanyModeBanner
          orgName={activeOrg?.name ?? "Empresa"}
          onExit={() => setActiveCompanyId(null)}
          onDetail={() => navigate(`/organizations/${activeCompanyId}`)}
        />
      )}

      <DashboardHero
        user={user}
        t={t}
        greetingKey={getGreetingKey()}
        firstName={firstName}
        subtitle={new Date().toLocaleDateString(i18n.language, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        subtitleIcon={<TrendingUp className="w-3.5 h-3.5" />}
        actions={
          <>
            <Button variant="secondary" className="w-auto" onClick={() => navigate("/reports")}>
              <FileText className="w-4 h-4 mr-1.5" />
              {t("trips.title")}
            </Button>
            <Button className="w-auto" onClick={() => navigate("/reports")}>
              <Plus className="w-4 h-4 mr-1.5" />
              {t("home.newTrip")}
            </Button>
          </>
        }
      />

      <KpisGrid
        amounts={amounts} reportsByStatus={reportsByStatus}
        showTeamStats={showTeamStats} teamMemberCount={teamMemberCount} t={t}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {showTeamStats && amounts.approved > 0 && (
            <div className={`bg-success/5 border border-success/20 ${radius.card} p-5 flex items-center justify-between`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 bg-success/10 ${radius.base} flex items-center justify-center text-success`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className={tokens.statCardLabel + " !text-success"}>{t("home.totalApproved")}</p>
                  <p className="text-xl font-bold text-success">{amounts.approved.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          )}
          {dashboardMainContent}
        </div>
        <RecentActivitySection
          t={t}
          recentCompleted={reportsByStatus.completed}
          navigate={navigate}
          dateLocale={dateLocale}
        />
      </div>

      {showManagementLinks && <QuickActionsGrid navigate={navigate} can={can} />}
      {reports && reports.length > 0 && <AnalyticsSection reports={reports} />}
    </div>
  );
};
