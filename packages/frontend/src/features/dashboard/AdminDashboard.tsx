import { useMemo } from "react";
import {
  FileText,
  TrendingUp,
  Users,
  Building2,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  useReportsQuery,
  useUserQuery,
  useUsersQuery,
  useDepartmentsQuery,
  useOrganizationsQuery,
  useScope,
  useScopeContext,
  usePermissions,
  type PermissionType,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CompanyModeBanner } from "./components/CompanyModeBanner";
import { QuickActionsGrid } from "./components/QuickActionsGrid";

// ── Sub-components ──────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-3 gap-10">
      <div className="col-span-2 h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
      <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
    </div>
  </div>
);

interface HeroSectionProps {
  t: any;
  user: any;
  greetingKey: string;
  firstName: string;
  navigate: (path: string) => void;
  can: (perm: PermissionType) => boolean;
}

const HeroSection = ({ t, user, greetingKey, firstName, navigate, can }: HeroSectionProps) => (
  <div className="relative bg-dark rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-secondary/5 rounded-full translate-y-1/2 pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/25 text-white font-black text-xl select-none">
            {user?.name?.charAt(0).toUpperCase() ?? <Sparkles className="w-6 h-6" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-dark rounded-full" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-brand/60" />
            <p className="text-[10px] font-black text-brand/60 uppercase tracking-widest">
              Panel de Administración
            </p>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t(greetingKey, { name: firstName })} 👋
          </h1>
          {user?.roleName && (
            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-brand/70 bg-brand/10 px-2.5 py-0.5 rounded-full">
              {user.roleName}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        {can("view_users") && (
          <Button
            variant="secondary"
            className="w-auto px-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => navigate("/users")}
          >
            <Users className="w-4 h-4 mr-2" />
            Equipo
          </Button>
        )}
        <Button
          className="w-auto px-5 shadow-xl shadow-brand/30"
          onClick={() => navigate("/trips")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Ver viajes
        </Button>
      </div>
    </div>
  </div>
);

const PendingApprovalsCard = ({ count }: { count: number }) => (
  <div
    className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${
      count > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
    }`}
    data-testid="pending-approvals-card"
  >
    {count > 0 && (
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    )}
    <div className="relative z-10 flex items-start justify-between">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${count > 0 ? "text-amber-600" : "text-gray-400"}`}>
        Por aprobar
      </p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${count > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-300"}`}>
        <AlertCircle className="w-5 h-5" />
      </div>
    </div>
    <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${count > 0 ? "text-amber-700" : "text-dark"}`}>
      {count}
    </h3>
    <p className={`relative z-10 text-xs font-bold ${count > 0 ? "text-amber-600/70" : "text-gray-400"}`}>
      {count > 0 ? "Requieren revisión" : "Todo al día"}
    </p>
  </div>
);

interface ApprovalsSectionProps {
  t: any;
  pendingReports: any[];
  navigate: (path: string) => void;
  dateLocale: any;
}

const ApprovalsSection = ({ t, pendingReports, navigate, dateLocale }: ApprovalsSectionProps) => (
  <section className="lg:col-span-2 space-y-5">
    <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${pendingReports.length > 0 ? "bg-amber-100" : "bg-gray-100"}`}>
        <Clock className={`w-4 h-4 ${pendingReports.length > 0 ? "text-amber-600" : "text-gray-400"}`} />
      </div>
      Aprobaciones pendientes
      {pendingReports.length > 0 && (
        <span className="ml-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
          {pendingReports.length}
        </span>
      )}
    </h2>

    {pendingReports.length === 0 ? (
      <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-gray-400 font-semibold max-w-xs leading-relaxed">
          {t("home.noPendingApprovals")}
        </p>
      </div>
    ) : (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {pendingReports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/trips/${report.id}`)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-amber-50/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-black text-sm text-amber-600 shrink-0">
                  {report.name?.charAt(0).toUpperCase() || "R"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-dark text-sm truncate group-hover:text-amber-600 transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="font-black text-dark text-sm">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                </span>
                <StatusBadge status={report.status} size="sm" />
                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
        {pendingReports.length > 6 && (
          <div className="p-4 border-t border-gray-50 text-center">
            <button
              onClick={() => navigate("/trips")}
              className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
            >
              {t("common.viewAll")} ({pendingReports.length})
            </button>
          </div>
        )}
      </div>
    )}
  </section>
);

const RecentActivitySection = ({ t, recentCompleted, navigate, dateLocale }: any) => (
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
      {recentCompleted.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-400 font-medium">{t("trips.noCompletedTrips")}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recentCompleted.map((report: any) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/trips/${report.id}`)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={report.status} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
);

// ── Main Component ──────────────────────────────────────────────────

export const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading: reportsLoading } = useReportsQuery();
  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { isGlobal } = useScope();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();
  const { data: orgs } = useOrganizationsQuery();
  const { can } = usePermissions();

  const effectiveCompanyId = user?.companyId ?? activeCompanyId ?? undefined;
  const { data: departments, isLoading: deptsLoading } = useDepartmentsQuery(effectiveCompanyId);

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  // ── Helpers ──────────────────────────────────────────────────────────
  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "home.greetingMorning";
    if (hour < 19) return "home.greetingAfternoon";
    return "home.greetingEvening";
  };

  const filteredReports = reports ?? [];
  const pendingReports = useMemo(
    () => filteredReports.filter((r) => r.status.toUpperCase() === "SUBMITTED"),
    [filteredReports],
  );

  const activeTripsCount = useMemo(
    () => filteredReports.filter((r) => ["CREATED", "DRAFT", "PENDING"].includes(r.status.toUpperCase())).length,
    [filteredReports],
  );

  const recentCompleted = useMemo(
    () =>
      filteredReports
        .filter((r) => ["APPROVED", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()))
        .slice(0, 5),
    [filteredReports],
  );

  const isCompanyMode = isGlobal && !!activeCompanyId;
  const activeOrg = orgs?.find((o) => o.id === activeCompanyId);
  const firstName = user?.name?.split(" ")[0] || "Usuario";

  if (reportsLoading || usersLoading || deptsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {isCompanyMode && (
        <CompanyModeBanner
          orgName={activeOrg?.name ?? "Empresa"}
          onExit={() => setActiveCompanyId(null)}
          onDetail={() => navigate(`/organizations/${activeCompanyId}`)}
        />
      )}

      {/* Hero Section */}
      <HeroSection 
        t={t} 
        user={user} 
        greetingKey={getGreetingKey()} 
        firstName={firstName} 
        navigate={navigate} 
        can={can} 
      />

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" data-testid="admin-stats">
        <StatCard
          variant="primary"
          title="Usuarios"
          value={String(users?.length ?? 0)}
          icon={<Users className="w-5 h-5" />}
          subtitle="Miembros del equipo"
        />
        <StatCard
          title="Departamentos"
          value={String(departments?.length ?? 0)}
          icon={<Building2 className="w-5 h-5" />}
          subtitle="Áreas de la empresa"
        />
        <PendingApprovalsCard count={pendingReports.length} />
        <StatCard
          title="Viajes activos"
          value={String(activeTripsCount)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="En curso en el equipo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <ApprovalsSection 
          t={t} 
          pendingReports={pendingReports} 
          navigate={navigate} 
          dateLocale={dateLocale} 
        />
        <RecentActivitySection 
          t={t} 
          recentCompleted={recentCompleted} 
          navigate={navigate} 
          dateLocale={dateLocale} 
        />
      </div>

      <QuickActionsGrid navigate={navigate} can={can} />
    </div>
  );
};
