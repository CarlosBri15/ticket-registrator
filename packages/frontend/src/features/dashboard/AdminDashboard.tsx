import React, { useMemo } from "react";
import {
  FileText,
  TrendingUp,
  Users,
  Building2,
  Shield,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import {
  useReportsQuery,
  useUserQuery,
  useUsersQuery,
  useDepartmentsQuery,
  useOrganizationsQuery,
  useScope,
  useScopeContext,
  usePermissions,
} from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { CompanyModeBanner } from "./components/CompanyModeBanner";
import { QuickActionsGrid } from "./components/QuickActionsGrid";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingStatsCard } from "./components/PendingStatsCard";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { RecentActivitySection } from "./components/RecentActivitySection.tsx";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { Button } from "../../components/ui/Button";

export const AdminDashboard = () => {
  const { t, getGreetingKey, dateLocale } = useDashboardHelpers();
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

  const filteredReports = useMemo(() => reports ?? [], [reports]);

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
        subtitle="Panel de Administración"
        subtitleIcon={<Shield className="w-3.5 h-3.5" />}
        actions={
          <React.Fragment>
            {can("view_users") && (
              <Button
                variant="ghost-white"
                className="w-auto"
                onClick={() => navigate("/users")}
              >
                <Users className="w-4 h-4 mr-1.5" />
                Equipo
              </Button>
            )}
            <Button
              variant="ghost-white"
              className="w-auto"
              onClick={() => navigate("/reports")}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Ver viajes
            </Button>
          </React.Fragment>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-stats">
        <StatCard
          variant="primary"
          title="Usuarios"
          value={String(users?.length ?? 0)}
          icon={<Users className="w-4 h-4" />}
          subtitle="Miembros del equipo"
        />
        <StatCard
          title="Departamentos"
          value={String(departments?.length ?? 0)}
          icon={<Building2 className="w-4 h-4" />}
          subtitle="Áreas de la empresa"
        />
        <PendingStatsCard count={pendingReports.length} />
        <StatCard
          title="Viajes activos"
          value={String(activeTripsCount)}
          icon={<TrendingUp className="w-4 h-4" />}
          subtitle="En curso en el equipo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PendingApprovalsList
            reports={pendingReports}
            navigate={navigate}
            dateLocale={dateLocale}
            t={t}
          />
        </div>
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
