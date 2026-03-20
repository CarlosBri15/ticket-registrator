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

const TeamKpis = ({ teamMemberCount, pendingCount, t }: { teamMemberCount: number; pendingCount: number; t: any }) => (
  <>
    <StatCard title={t("home.teamMembers")} value={teamMemberCount.toString()} icon={<Users className="w-5 h-5" />} subtitle={t("home.activeMembers")} />
    <PendingStatsCard count={pendingCount} label={t("home.pendingApprovals")} />
  </>
);

const UserKpis = ({ activeCount, rejectedCount, t }: { activeCount: number; rejectedCount: number; t: any }) => (
  <>
    <StatCard title={t("home.activeTrips")} value={activeCount.toString()} icon={<Plane className="w-5 h-5" />} subtitle={t("home.activeTripsSubtitle")} />
    <StatCard 
      title={t("home.rejectedItems")} 
      value={rejectedCount.toString()} 
      icon={<TrendingUp className="w-5 h-5" />} 
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <StatCard
      variant="primary"
      title={t("home.pendingReimbursement")}
      value={`${amounts.pending.toFixed(2)} €`}
      icon={<Wallet className="w-5 h-5" />}
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
        <div className="space-y-5">
          <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
            <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand" />
            </div>
            {t("home.activeTrip")}
          </h2>
          <ActiveTripCard currentTrip={currentTrip} navigate={navigate} dateLocale={dateLocale} t={t} />
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand" />
          </div>
          {t("home.activeTrip")}
        </h2>
        <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center hover:border-brand/30 hover:bg-gray-50/30 transition-all duration-300 group">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-brand/5 transition-colors">
            <Plane className="w-8 h-8 text-gray-300 group-hover:text-brand/40 transition-colors" />
          </div>
          <p className="text-gray-400 font-semibold mb-6 max-w-xs leading-relaxed">{t("trips.noActiveTrips")}</p>
          <Button variant="secondary" className="w-auto bg-white border-gray-200" onClick={() => navigate("/trips")}>
            <Plus className="w-4 h-4 mr-2" /> {t("home.createFirst")}
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
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
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
            <Button variant="secondary" className="w-auto px-6" onClick={() => navigate("/trips")}>
              <FileText className="w-4 h-4 mr-2" />
              {t("trips.title")}
            </Button>
            <Button className="w-auto px-6 shadow-xl shadow-brand/20" onClick={() => navigate("/trips")}>
              <Plus className="w-4 h-4 mr-2" />
              {t("home.newTrip")}
            </Button>
          </>
        }
      />

      <KpisGrid
        amounts={amounts} reportsByStatus={reportsByStatus}
        showTeamStats={showTeamStats} teamMemberCount={teamMemberCount} t={t}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {showTeamStats && amounts.approved > 0 && (
            <div className="bg-green-50/50 border border-green-100 rounded-[2.5rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider">{t("home.totalApproved")}</p>
                  <p className="text-2xl font-black text-green-800">{amounts.approved.toFixed(2)} €</p>
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
