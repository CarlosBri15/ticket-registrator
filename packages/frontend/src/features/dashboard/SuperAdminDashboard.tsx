import { Suspense, useState, useMemo } from "react";
import { Plus, Users, Globe } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { DashboardHero } from "./components/DashboardHero";
import {
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScopeContext,
} from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { countCreatedThisMonth, buildMonthlyGrowth } from "./utils";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { EmptyOrgsCard } from "./components/EmptyOrgsCard";
import { LargestOrgCard } from "./components/LargestOrgCard";
import { OrgGrowthChart, OrgDistributionChart } from "./components/LazyDashboardCharts";
import { ChartSkeleton } from "../../components/ui/ChartSkeleton";
import { OrganizationsSection } from "./components/OrganizationsSection";

export const SuperAdminGlobalDashboard = () => {
  const { t, getGreetingKey, dateLocale } = useDashboardHelpers();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: orgs, isLoading: loadingOrgs } = useOrganizationsQuery();
  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { setActiveCompanyId } = useScopeContext();

  const [search, setSearch] = useState("");

  const usersPerOrg = useMemo(
    () =>
      (users ?? []).reduce<Record<string, number>>((acc, u) => {
        if (u.companyId) acc[u.companyId] = (acc[u.companyId] ?? 0) + 1;
        return acc;
      }, {}),
    [users],
  );

  const emptyOrgCount = useMemo(
    () => (orgs ?? []).filter((o) => (usersPerOrg[o.id] ?? 0) === 0).length,
    [orgs, usersPerOrg],
  );

  const largestOrg = useMemo(() => {
    if (!orgs?.length) return null;
    return orgs.reduce(
      (best, o) =>
        (usersPerOrg[o.id] ?? 0) > (usersPerOrg[best.id] ?? 0) ? o : best,
      orgs[0],
    );
  }, [orgs, usersPerOrg]);

  const newOrgsThisMonth = useMemo(
    () => (orgs ? countCreatedThisMonth(orgs) : 0),
    [orgs],
  );

  const distributionData = useMemo(
    () =>
      (orgs ?? [])
        .map((o) => ({
          name: o.name.length > 14 ? o.name.substring(0, 12) + "…" : o.name,
          usuarios: usersPerOrg[o.id] ?? 0,
        }))
        .sort((a, b) => b.usuarios - a.usuarios)
        .slice(0, 8),
    [orgs, usersPerOrg],
  );

  const orgGrowthData = useMemo(
    () => (orgs ? buildMonthlyGrowth(orgs, 6, dateLocale) : []),
    [orgs, dateLocale],
  );

  const filteredOrgs = useMemo(
    () => orgs?.filter((o) => search === "" || o.name.toLowerCase().includes(search.toLowerCase())),
    [orgs, search],
  );

  const firstName = user?.name?.split(" ")[0] || t("layout.defaultUser");
  const loading = loadingOrgs || loadingUsers;

  const orgsCount = loading ? "—" : String(orgs?.length ?? 0);
  const usersCount = loading ? "—" : String(users?.length ?? 0);

  const newOrgsLabel = loading
    ? "—"
    : (newOrgsThisMonth > 0
      ? t("dashboard.newOrgsLabel", { count: newOrgsThisMonth })
      : t("dashboard.noNewOrgs"));

  return (
    <div className={`flex flex-col gap-8 ${loading ? "animate-pulse" : ""}`}>
      <DashboardHero
        user={user}
        t={t}
        greetingKey={getGreetingKey()}
        firstName={firstName}
        subtitle={t("dashboard.subtitleGlobal")}
        subtitleIcon={<Globe className="w-3.5 h-3.5" aria-hidden={true} />}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate("/organizations")}
              leftIcon={<Globe className="w-3.5 h-3.5" />}
            >
              {t("layout.organizations")}
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/organizations")}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {t("dashboard.newOrg")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="global-stats">
        <StatCard
          variant="primary"
          title={t("layout.organizations")}
          value={orgsCount}
          icon={<Globe className="w-4 h-4" aria-hidden={true} />}
          subtitle={newOrgsLabel}
        />

        <StatCard
          title={t("dashboard.totalUsers")}
          value={usersCount}
          icon={<Users className="w-4 h-4" aria-hidden={true} />}
          subtitle={t("dashboard.platformWide")}
        />

        <EmptyOrgsCard count={loading ? 0 : emptyOrgCount} />
        <LargestOrgCard
          largestOrg={largestOrg}
          userCount={largestOrg ? usersPerOrg[largestOrg.id] : 0}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] animate-pulse" />
          <div className="h-48 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] animate-pulse" />
        </div>
      ) : (
        orgs && orgs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="global-charts">
            <Suspense fallback={<ChartSkeleton height={192} />}>
              <OrgGrowthChart data={orgGrowthData} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton height={192} />}>
              <OrgDistributionChart data={distributionData} />
            </Suspense>
          </div>
        )
      )}

      <OrganizationsSection
        filteredOrgs={loading ? [] : filteredOrgs}
        usersPerOrg={usersPerOrg}
        dateLocale={dateLocale}
        setActiveCompanyId={setActiveCompanyId}
        navigate={navigate}
        t={t}
        totalOrgs={loading ? 0 : (orgs?.length ?? 0)}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};
