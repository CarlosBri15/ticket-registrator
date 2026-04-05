import { useState, useMemo } from "react";
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
  Globe,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
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
import { DashboardHero } from "./components/DashboardHero";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { tokens } from "../../styles/theme";
import { userIcon } from "@ticket-registrator/shared/assets";

const EmptyOrgsCard = ({ count }: { count: number }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${count > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}
      data-testid="empty-orgs-card"
    >
      {count > 0 && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${count > 0 ? "text-amber-600" : "text-gray-400"}`}>
          {t("dashboard.orgsWithoutUsers")}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${count > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-300"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${count > 0 ? "text-amber-700" : "text-dark"}`}>
        {count}
      </h3>
      <p className={`relative z-10 text-xs font-bold ${count > 0 ? "text-amber-600/70" : "text-gray-400"}`}>
        {count > 0 ? t("dashboard.orgsRequireAttention") : t("dashboard.orgsAllHaveUsers")}
      </p>
    </div>
  );
};

const LargestOrgCard = ({ largestOrg, userCount = 0 }: { largestOrg: { name: string } | null; userCount?: number }) => {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/3 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t("dashboard.orgLargest")}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand/5 text-brand">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
      <h3 className="relative z-10 text-xl font-black tracking-tight text-dark truncate" data-testid="largest-org-name">
        {largestOrg?.name ?? "—"}
      </h3>
      <p className="relative z-10 text-xs font-bold text-gray-400">
        {largestOrg ? t("dashboard.userCount", { count: userCount }) : t("dashboard.orgNoData")}
      </p>
    </div>
  );
};

const GrowthChart = ({ data }: { data: { month: string; count: number }[] }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {t("dashboard.orgGrowthChart")}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#D1D5DB" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "1rem", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", fontSize: 12, fontWeight: 700 }}
            formatter={(value: number) => [value, t("dashboard.newOrgsTooltip")]}
            cursor={{ fill: "#F9FAFB" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DistributionChart = ({ data }: { data: { name: string; usuarios: number }[] }) => {
  const { t } = useTranslation();
  const hasNoData = data.every((d) => d.usuarios === 0);

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {t("dashboard.orgDistributionChart")}
      </p>
      {hasNoData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-gray-400 font-medium text-center max-w-[180px] leading-relaxed">{t("dashboard.orgNoUsersYet")}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" barSize={14} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#D1D5DB" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fontWeight: 700, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "1rem", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", fontSize: 12, fontWeight: 700 }}
              formatter={(value: number) => [value, t("layout.users")]}
              cursor={{ fill: "#F9FAFB" }}
            />
            <Bar dataKey="usuarios" radius={[0, 6, 6, 0]} fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
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
  filteredOrgs, usersPerOrg, dateLocale, setActiveCompanyId, navigate, t, totalOrgs, search, setSearch
}: OrganizationsSectionProps) => {
  const hasResults = (filteredOrgs?.length ?? 0) > 0;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
            <Globe className="w-4 h-4 text-brand" />
          </div>
          {t("layout.organizations")}
        </h2>
        <Button
          variant="ghost-brand"
          size="sm"
          onClick={() => navigate("/organizations")}
          className="!text-[10px] !font-black !uppercase !tracking-widest"
        >
          {t("common.viewAll")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("dashboard.orgSearchPlaceholder")}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm transition-all"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 !p-1 !border-none !shadow-none"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {hasResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredOrgs?.map((org) => {
            const userCount = usersPerOrg[org.id] ?? 0;
            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 shrink-0 text-white font-black text-lg">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-dark truncate">{org.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs flex items-center gap-1 font-semibold ${userCount === 0 ? "text-amber-500" : "text-gray-400"}`}>
                      <Users className="w-3 h-3" />
                      {t("dashboard.userCount", { count: userCount })}
                    </span>
                    <span className="text-xs text-gray-300 font-mono truncate">
                      {org.id.substring(0, 8)}…
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {t("dashboard.orgSince", { date: format(new Date(org.createdAt), "dd MMM yyyy", { locale: dateLocale }) })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveCompanyId(org.id)}
                    className="!px-3 !py-1.5 shadow-sm shadow-brand/20"
                  >
                    {t("common.view")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                    className="!p-2 !border-none !shadow-none"
                    title={t("dashboard.orgFullDetail")}
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-300 hover:text-brand" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">
            {search ? t("dashboard.orgNoResults") : t("dashboard.orgNone")}
          </p>
        </div>
      )}

      {totalOrgs > 0 && (
        <p className="text-xs text-gray-400 font-medium text-center">
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
    return orgs.reduce((best, o) =>
      (usersPerOrg[o.id] ?? 0) > (usersPerOrg[best.id] ?? 0) ? o : best,
      orgs[0]
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
    : newOrgsThisMonth > 0
      ? t("dashboard.newOrgsLabel", { count: newOrgsThisMonth })
      : t("dashboard.noNewOrgs");

  return (
    <div className={`space-y-10 animate-in fade-in duration-500 pb-10 -mx-6 -mt-5 md:-mx-10 lg:-mt-6 ${loading ? "animate-pulse" : ""}`}>
      <div className={tokens.headerPage}>
        <span className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {firstName}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="hidden md:inline-flex w-auto px-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => navigate("/organizations")}
            leftIcon={<Globe className="w-4 h-4" />}
          >
            {t("layout.organizations")}
          </Button>
          <Button
            className="hidden md:inline-flex w-auto px-5 shadow-xl shadow-brand/30"
            onClick={() => navigate("/organizations")}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t("dashboard.newOrg")}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate("/settings")}
            className="!bg-[#E8E8FF]"
          >
            <img src={userIcon} alt="avatar" className="w-10 h-10 object-contain" />
          </Button>
        </div>
      </div>

      <div className="px-6 md:px-10 space-y-10">
        <DashboardHero
          user={user}
          t={t}
          greetingKey={getGreetingKey()}
          firstName={firstName}
          subtitle={t("dashboard.subtitleGlobal")}
          subtitleIcon={<Globe className="w-3.5 h-3.5" />}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" data-testid="global-stats">
          <StatCard
            variant="primary"
            title={t("layout.organizations")}
            value={orgsCount}
            icon={<Globe className="w-5 h-5" />}
            subtitle={newOrgsLabel}
          />

          <StatCard
            title={t("dashboard.totalUsers")}
            value={usersCount}
            icon={<Users className="w-5 h-5" />}
            subtitle={t("dashboard.platformWide")}
          />

          <EmptyOrgsCard count={loading ? 0 : emptyOrgCount} />
          <LargestOrgCard largestOrg={largestOrg} userCount={largestOrg ? usersPerOrg[largestOrg.id] : 0} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
            <div className="h-48 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
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
    </div>
  );
};
