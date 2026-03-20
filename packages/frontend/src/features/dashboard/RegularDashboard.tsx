import { useMemo } from "react";
import {
  Wallet,
  Plane,
  AlertCircle,
  Plus,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Users,
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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import { getReportsSummary, getAmountsSummary, getStatusClasses } from "./utils";
import { CompanyModeBanner } from "./components/CompanyModeBanner";
import { ActiveTripCard } from "./components/ActiveTripCard";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { QuickActionsGrid } from "./components/QuickActionsGrid";
import { AnalyticsSection } from "./components/AnalyticsSection";

// --- Shared sub-components ---

const StatusBadgeSmall = ({ status }: { status: string }) => (
  <div
    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${getStatusClasses(status)}`}
  >
    {status.charAt(0).toUpperCase()}
  </div>
);

const TeamKpis = ({ teamMemberCount, pendingCount, t }: { teamMemberCount: number; pendingCount: number; t: any }) => (
  <>
    <StatCard title={t("home.teamMembers")} value={teamMemberCount.toString()} icon={<Users className="w-5 h-5" />} subtitle={t("home.activeMembers")} />
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${pendingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}>
      {pendingCount > 0 && <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />}
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${pendingCount > 0 ? "text-amber-600" : "text-gray-400"}`}>{t("home.pendingApprovals")}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pendingCount > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-300"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${pendingCount > 0 ? "text-amber-700" : "text-dark"}`}>{pendingCount}</h3>
      <p className={`relative z-10 text-xs font-bold ${pendingCount > 0 ? "text-amber-600/70" : "text-gray-400"}`}>
        {pendingCount > 0 ? t("home.requiresReview") : t("home.noPending")}
      </p>
    </div>
  </>
);

const UserKpis = ({ activeCount, rejectedCount, t }: { activeCount: number; rejectedCount: number; t: any }) => (
  <>
    <StatCard title={t("home.activeTrips")} value={activeCount.toString()} icon={<Plane className="w-5 h-5" />} subtitle={t("home.activeTripsSubtitle")} />
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${rejectedCount > 0 ? "bg-accent/5 border-accent/20" : "bg-white border-gray-100"}`}>
      {rejectedCount > 0 && <div className="absolute top-0 right-0 w-36 h-36 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />}
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${rejectedCount > 0 ? "text-accent/70" : "text-gray-400"}`}>{t("home.rejectedItems")}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rejectedCount > 0 ? "bg-accent/10 text-accent" : "bg-gray-50 text-gray-300"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${rejectedCount > 0 ? "text-accent" : "text-dark"}`}>{rejectedCount}</h3>
      <p className={`relative z-10 text-xs font-bold ${rejectedCount > 0 ? "text-accent/60" : "text-gray-400"}`}>
        {rejectedCount > 0 ? t("home.requiresAttention") : t("home.noIncidents")}
      </p>
    </div>
  </>
);

const DashboardHeader = ({
  user, t, i18n, firstName, greetingKey, navigate,
}: {
  user: any; t: any; i18n: any; firstName: string; greetingKey: string; navigate: any;
}) => (
  <div className="relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
    <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-secondary/5 rounded-full translate-y-2/3 pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/25 text-white font-black text-xl select-none">
            {user?.name?.charAt(0).toUpperCase() ?? <Sparkles className="w-6 h-6" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-0.5 capitalize">
            {new Date().toLocaleDateString(i18n.language, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-2xl font-black text-dark tracking-tight">
            {t(greetingKey, { name: firstName })} 👋
          </h1>
          {user?.roleName && (
            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-brand/60 bg-brand/5 px-2.5 py-0.5 rounded-full">
              {user.roleName}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <Button variant="secondary" className="w-auto px-6" onClick={() => navigate("/trips")}>
          <FileText className="w-4 h-4 mr-2" />
          {t("trips.title")}
        </Button>
        <Button className="w-auto px-6 shadow-xl shadow-brand/20" onClick={() => navigate("/trips")}>
          <Plus className="w-4 h-4 mr-2" />
          {t("home.newTrip")}
        </Button>
      </div>
    </div>
  </div>
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

const MainGridContent = ({ showTeamStats, canApprove, reportsByStatus, currentTrip, navigate, dateLocale, t }: any) => {
  if (showTeamStats) {
    return (
      <PendingApprovalsList
        reports={canApprove ? reportsByStatus.pending : reportsByStatus.active}
        navigate={navigate}
        dateLocale={dateLocale}
        t={t}
      />
    );
  }

  if (currentTrip) {
    return <ActiveTripCard currentTrip={currentTrip} navigate={navigate} dateLocale={dateLocale} t={t} />;
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center hover:border-brand/30 hover:bg-gray-50/30 transition-all duration-300 group">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-brand/5 transition-colors">
        <Plane className="w-8 h-8 text-gray-300 group-hover:text-brand/40 transition-colors" />
      </div>
      <p className="text-gray-400 font-semibold mb-6 max-w-xs leading-relaxed">{t("trips.noActiveTrips")}</p>
      <Button variant="secondary" className="w-auto bg-white border-gray-200" onClick={() => navigate("/trips")}>
        <Plus className="w-4 h-4 mr-2" /> {t("home.createFirst")}
      </Button>
    </div>
  );
};

const MainDashboardGrid = ({
  showTeamStats, canApprove, reportsByStatus, currentTrip, navigate, dateLocale, t, amounts,
}: {
  showTeamStats: boolean; canApprove: boolean; reportsByStatus: any; currentTrip: any;
  navigate: any; dateLocale: Locale; t: any; amounts: any;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
    <section className="lg:col-span-2 space-y-5">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
          {showTeamStats ? <Clock className="w-4 h-4 text-brand" /> : <TrendingUp className="w-4 h-4 text-brand" />}
        </div>
        <MainGridTitle showTeamStats={showTeamStats} canApprove={canApprove} t={t} />
      </h2>

      <MainGridContent 
        showTeamStats={showTeamStats} 
        canApprove={canApprove} 
        reportsByStatus={reportsByStatus} 
        currentTrip={currentTrip} 
        navigate={navigate} 
        dateLocale={dateLocale} 
        t={t} 
      />
    </section>

    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {t("home.recentActivity")}
        </h2>
        <button
          onClick={() => navigate("/trips")}
          className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline underline-offset-2"
        >
          {t("common.viewAll")}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {reportsByStatus.completed.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-400 font-medium">{t("trips.noCompletedTrips")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reportsByStatus.completed.slice(0, 5).map((report: any) => (
              <button
                key={report.id}
                type="button"
                onClick={() => navigate(`/trips/${report.id}`)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadgeSmall status={report.status} />
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">{report.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-black text-dark text-sm">
                    {report.approved_amount || report.requested_amount}
                    <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showTeamStats && amounts.approved > 0 && (
        <div className="bg-green-50 rounded-[2rem] p-5 border border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t("home.totalApproved")}</p>
              <p className="text-xl font-black text-green-700 tracking-tighter">{amounts.approved.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      )}
    </section>
  </div>
);

// --- Regular Dashboard (non-global or company mode) ---

export const RegularDashboard = () => {
  const { t, i18n } = useTranslation();
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

  if (reportsLoading || !data) {
    return (
      <div className="space-y-8 pb-10">
        <div className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
          <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  const { reportsByStatus, amounts, currentTrip, teamMemberCount } = data;
  const dateLocale = i18n.language.startsWith("es") ? es : enUS;
  const currentHour = new Date().getHours();
  const greetingKey = (() => {
    if (currentHour < 12) return "home.greetingMorning";
    if (currentHour < 19) return "home.greetingAfternoon";
    return "home.greetingEvening";
  })();
  const firstName = user?.name?.split(" ")[0] || "Usuario";
  const canApprove = can("approve_reports");
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

      <DashboardHeader
        user={user} t={t} i18n={i18n} firstName={firstName}
        greetingKey={greetingKey} navigate={navigate}
      />

      <KpisGrid
        amounts={amounts} reportsByStatus={reportsByStatus}
        showTeamStats={showTeamStats} teamMemberCount={teamMemberCount} t={t}
      />

      <MainDashboardGrid
        showTeamStats={showTeamStats} canApprove={canApprove}
        reportsByStatus={reportsByStatus} currentTrip={currentTrip}
        navigate={navigate} dateLocale={dateLocale} t={t} amounts={amounts}
      />

      {showManagementLinks && <QuickActionsGrid navigate={navigate} can={can} />}
      {reports && reports.length > 0 && <AnalyticsSection reports={reports} />}
    </div>
  );
};
