import { useState, useMemo } from "react";
import {
  Plus,
  TrendingUp,
  Users,
  Globe,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { SectionCard } from "../../components/ui/SectionCard";
import { DashboardHero } from "./components/DashboardHero";
import { SearchInput } from "../../components/ui/SearchInput";
import {
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScopeContext,
} from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { countCreatedThisMonth, buildMonthlyGrowth } from "./utils";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";

const EmptyOrgsCard = ({ count }: { count: number }) => {
  const { t } = useTranslation();
  const hasIssues = count > 0;
  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-lg border ${
        hasIssues
          ? "bg-amber-50 border-amber-100"
          : "bg-[var(--color-surface-card)] border-[var(--color-border-main)]"
      }`}
      data-testid="empty-orgs-card"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-sans-semibold uppercase tracking-wide ${
            hasIssues ? "text-amber-700" : "text-dark/50"
          }`}
        >
          {t("dashboard.orgsWithoutUsers")}
        </p>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            hasIssues
              ? "bg-amber-100 text-amber-700"
              : "bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/30"
          }`}
        >
          <AlertCircle className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <h3
        className={`text-[26px] font-sans-bold leading-none tracking-tight ${
          hasIssues ? "text-amber-700" : "text-dark"
        }`}
      >
        {count}
      </h3>

      <p
        className={`text-[12px] font-sans-medium ${
          hasIssues ? "text-amber-700/70" : "text-dark/45"
        }`}
      >
        {hasIssues ? t("dashboard.orgsRequireAttention") : t("dashboard.orgsAllHaveUsers")}
      </p>
    </div>
  );
};

const LargestOrgCard = ({
  largestOrg,
  userCount = 0,
}: {
  largestOrg: { name: string } | null;
  userCount?: number;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 p-5 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-sans-semibold uppercase tracking-wide text-dark/50">
          {t("dashboard.orgLargest")}
        </p>
        <div className="w-7 h-7 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/45 shrink-0">
          <TrendingUp className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <h3
        className="text-[18px] font-sans-bold tracking-tight text-dark truncate"
        data-testid="largest-org-name"
      >
        {largestOrg?.name ?? "—"}
      </h3>

      <p className="text-[12px] font-sans-medium text-dark/45">
        {largestOrg ? t("dashboard.userCount", { count: userCount }) : t("dashboard.orgNoData")}
      </p>
    </div>
  );
};

const GrowthChart = ({ data }: { data: { month: string; count: number }[] }) => {
  const { t } = useTranslation();
  return (
    <SectionCard title={t("dashboard.orgGrowthChart")}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontWeight: 600, fill: "#6B6560" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fontWeight: 500, fill: "#A09A95" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid #E5E4E0",
              boxShadow: "0px 8px 24px rgba(28,25,23,0.08)",
              fontSize: 12,
              fontWeight: 600,
            }}
            formatter={(value) => [value as number, t("dashboard.newOrgsTooltip")]}
            cursor={{ fill: "#F5F4F0" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#1C1917" />
        </BarChart>
      </ResponsiveContainer>
    </SectionCard>
  );
};

const DistributionChart = ({ data }: { data: { name: string; usuarios: number }[] }) => {
  const { t } = useTranslation();
  const hasNoData = data.every((d) => d.usuarios === 0);

  return (
    <SectionCard title={t("dashboard.orgDistributionChart")}>
      {hasNoData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-[13px] font-sans-medium text-dark/45 text-center max-w-[180px]">
            {t("dashboard.orgNoUsersYet")}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" barSize={14} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 10, fontWeight: 500, fill: "#A09A95" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#6B6560" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid #E5E4E0",
                boxShadow: "0px 8px 24px rgba(28,25,23,0.08)",
                fontSize: 12,
                fontWeight: 600,
              }}
              formatter={(value) => [value as number, t("layout.users")]}
              cursor={{ fill: "#F5F4F0" }}
            />
            <Bar dataKey="usuarios" radius={[0, 4, 4, 0]} fill="#1C1917" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
};

interface OrganizationsSectionProps {
  filteredOrgs: { id: string; name: string; createdAt: string }[] | undefined;
  usersPerOrg: Record<string, number>;
  dateLocale: Locale;
  setActiveCompanyId: (id: string | null) => void;
  navigate: (path: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
  totalOrgs: number;
  search: string;
  setSearch: (v: string) => void;
}

const OrganizationsSection = ({
  filteredOrgs,
  usersPerOrg,
  dateLocale,
  setActiveCompanyId,
  navigate,
  t,
  totalOrgs,
  search,
  setSearch,
}: OrganizationsSectionProps) => {
  const hasResults = (filteredOrgs?.length ?? 0) > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-dark/50" aria-hidden={true} />
          <h2 className="text-[15px] font-sans-bold text-dark tracking-tight">
            {t("layout.organizations")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/organizations")}
          className="text-[12px] font-sans-medium text-dark/50 hover:text-dark underline underline-offset-2 transition-colors"
        >
          {t("common.viewAll")}
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t("dashboard.orgSearchPlaceholder")}
      />

      {hasResults ? (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {filteredOrgs?.map((org) => {
            const userCount = usersPerOrg[org.id] ?? 0;
            return (
              <div
                key={org.id}
                className="group flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-dark text-white flex items-center justify-center shrink-0 font-sans-bold text-[12px]">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                    {org.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-sans-medium">
                    <span
                      className={`flex items-center gap-1 ${
                        userCount === 0 ? "text-amber-700" : "text-dark/55"
                      }`}
                    >
                      <Users className="w-3 h-3" aria-hidden={true} />
                      {t("dashboard.userCount", { count: userCount })}
                    </span>
                    <span className="text-dark/20">·</span>
                    <span className="text-dark/40">
                      {format(new Date(org.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                </button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveCompanyId(org.id)}
                >
                  {t("common.view")}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="text-dark/30 hover:text-dark transition-colors p-1 opacity-0 group-hover:opacity-100"
                  title={t("dashboard.orgFullDetail")}
                >
                  <ChevronRight className="w-4 h-4" aria-hidden={true} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-14 gap-2 text-center rounded-lg border border-dashed border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <Globe className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="text-[13px] font-sans-medium text-dark/55">
            {search ? t("dashboard.orgNoResults") : t("dashboard.orgNone")}
          </p>
        </div>
      )}

      {totalOrgs > 0 && (
        <p className="text-[12px] font-sans-medium text-dark/45 text-center">
          {t("dashboard.orgCounter", { filtered: filteredOrgs?.length ?? 0, total: totalOrgs })}
        </p>
      )}
    </section>
  );
};

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
            <GrowthChart data={orgGrowthData} />
            <DistributionChart data={distributionData} />
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
