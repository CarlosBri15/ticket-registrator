import { useMemo } from "react";
import {
  Wallet,
  Plane,
  AlertCircle,
  Plus,
  FileText,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
  Receipt,
  Sparkles,
  Users,
  CheckCircle,
  Building2,
  Shield,
  Layers,
  Lock,
  BarChart2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  useReportsQuery,
  useUserQuery,
  useTicketsQuery,
  useUsersQuery,
  ReportStatus,
  useScope,
  usePermissions,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import type { IReport } from "@ticket-registrator/shared";
import { getMonthlyExpenses, getExpensesByType } from "../../utils/reportAnalytics";

// ---------- Helpers ----------

const getStatusClasses = (status: string) => {
  const s = status.toUpperCase();
  if (s === "APPROVED" || s === ReportStatus.APPROVED.toUpperCase()) return "bg-green-50 text-green-600";
  if (s === "DECLINED" || s === "REJECTED" || s === ReportStatus.DECLINED.toUpperCase()) return "bg-red-50 text-accent";
  return "bg-gray-50 text-gray-400";
};

const getReportsSummary = (reports: IReport[]) => {
  return reports.reduce((acc, r) => {
    const status = r.status.toUpperCase();
    if (["CREATED", "DRAFT", "PENDING", "SUBMITTED"].includes(status)) acc.active.push(r);
    if (["APPROVED", "PAID", "REJECTED", "DECLINED"].includes(status)) acc.completed.push(r);
    if (status === "SUBMITTED") acc.pending.push(r);
    return acc;
  }, { active: [] as IReport[], completed: [] as IReport[], pending: [] as IReport[] });
};

const getAmountsSummary = (reports: IReport[]) => {
  return reports.reduce((acc, r) => {
    const s = r.status.toUpperCase();
    if (s === "SUBMITTED") acc.pending += r.requested_amount;
    if (s === "APPROVED") acc.approved += (r.approved_amount || 0);
    if (s === "DECLINED" || s === "REJECTED") acc.rejectedCount++;
    return acc;
  }, { pending: 0, approved: 0, rejectedCount: 0 });
};

// ---------- Sub-components ----------

const StatusBadgeSmall = ({ status }: { status: string }) => (
  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${getStatusClasses(status)}`}>
    {status.charAt(0).toUpperCase()}
  </div>
);

const ActiveTripCard = ({
  currentTrip,
  navigate,
  dateLocale,
  t,
}: {
  currentTrip: IReport;
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  const { data: tickets } = useTicketsQuery(currentTrip.id);
  const ticketCount = tickets?.length ?? 0;
  const totalAmount =
    tickets?.reduce((acc: number, tk: any) => acc + (tk.amount || 0), 0) ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/trips/${currentTrip.id}`)}
      className="w-full text-left relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/10 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-60 h-60 bg-brand/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={currentTrip.status} size="md" />
            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase font-mono">
              #{currentTrip.id.substring(0, 8)}
            </span>
          </div>
          <div className="w-10 h-10 bg-brand/5 rounded-2xl flex items-center justify-center group-hover:bg-brand transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-dark tracking-tight group-hover:text-brand transition-colors duration-300 leading-tight">
            {currentTrip.name}
          </h3>
          <p className="text-gray-400 font-medium flex items-center gap-2 mt-2 text-sm">
            <Calendar className="w-4 h-4 text-brand/50" />
            {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} —{" "}
            {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        <div className="flex items-end justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
            <Receipt className="w-4 h-4 text-brand/60" />
            <span className="text-sm font-black text-dark">{ticketCount}</span>
            <span className="text-xs text-gray-400 font-medium">{t("home.processedTickets")}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t("home.currentExpense")}</p>
            <p className="text-3xl font-black text-brand tracking-tighter leading-none">
              {totalAmount > 0 ? totalAmount.toFixed(2) : currentTrip.requested_amount}
              <span className="text-base font-bold text-brand/50 ml-1">{currentTrip.currency}</span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};

const PendingApprovalsList = ({
  reports,
  navigate,
  dateLocale,
  t,
}: {
  reports: IReport[];
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-gray-400 font-semibold max-w-xs leading-relaxed">
          {t("home.noPendingApprovals")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {reports.slice(0, 6).map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => navigate(`/trips/${report.id}`)}
            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center font-black text-sm text-brand shrink-0">
                {report.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                  {report.name}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <div className="text-right">
                <span className="font-black text-dark text-sm block leading-none">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                </span>
              </div>
              <StatusBadge status={report.status} size="sm" />
              <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
      {reports.length > 6 && (
        <div className="p-4 border-t border-gray-50 text-center">
          <button
            onClick={() => navigate("/trips")}
            className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
          >
            {t("common.viewAll")} ({reports.length})
          </button>
        </div>
      )}
    </div>
  );
};

const QuickActionsGrid = ({
  navigate,
  can,
}: {
  navigate: (path: string) => void;
  can: (p: any) => boolean;
}) => {
  const { t } = useTranslation();
  const links = [
    { labelKey: "layout.users", icon: Users, path: "/users", permission: "view_users" },
    { labelKey: "layout.departments", icon: Building2, path: "/departments", permission: "view_departments" },
    { labelKey: "layout.roles", icon: Layers, path: "/roles", permission: "view_roles" },
    { labelKey: "layout.permissions", icon: Lock, path: "/permissions", permission: "view_permissions" },
    { labelKey: "layout.organizations", icon: Shield, path: "/organizations", permission: "view_company" },
  ].filter((l) => can(l.permission as any));

  if (links.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
          <Layers className="w-4 h-4 text-gray-400" />
        </div>
        {t("layout.management")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {links.map(({ labelKey, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 flex flex-col items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-brand group-hover:bg-brand/10 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-dark tracking-tight group-hover:text-brand transition-colors">
              {t(labelKey)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

// ---------- Analytics ----------

const CHART_COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

const LegendFormatter = (value: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>
    {value.length > 18 ? value.substring(0, 16) + "…" : value}
  </span>
);

const AnalyticsSection = ({ reports }: { reports: IReport[] }) => {
  const { t } = useTranslation();

  const monthly = getMonthlyExpenses(reports, 6);
  const byType = getExpensesByType(reports).map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const hasMonthly = monthly.length > 0;
  const hasType = byType.length > 0;

  if (!hasMonthly && !hasType) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-brand" />
        </div>
        {t("analytics.title")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {t("analytics.monthlyExpenses")}
          </p>
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#D1D5DB" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid #F3F4F6",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                  cursor={{ fill: "#F9FAFB" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-gray-400 font-medium text-center max-w-[180px] leading-relaxed">
                {t("analytics.noData")}
              </p>
            </div>
          )}
        </div>

        {/* Type donut chart */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {t("analytics.expensesByType")}
          </p>
          {hasType ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid #F3F4F6",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={LegendFormatter}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-gray-400 font-medium text-center max-w-[180px] leading-relaxed">
                {t("analytics.noData")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ---------- Main Page Components ----------

const DashboardHeader = ({
  user, t, i18n, firstName, greetingKey, navigate
}: {
  user: any; t: any; i18n: any; firstName: string; greetingKey: string; navigate: any
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

const TeamKpis = ({ teamMemberCount, pendingCount, t }: { teamMemberCount: number; pendingCount: number; t: any }) => (
  <>
    <StatCard
      title={t("home.teamMembers")}
      value={teamMemberCount.toString()}
      icon={<Users className="w-5 h-5" />}
      subtitle={t("home.activeMembers")}
    />
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${pendingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}>
      {pendingCount > 0 && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${pendingCount > 0 ? "text-amber-600" : "text-gray-400"}`}>
          {t("home.pendingApprovals")}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pendingCount > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-300"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${pendingCount > 0 ? "text-amber-700" : "text-dark"}`}>
        {pendingCount}
      </h3>
      <p className={`relative z-10 text-xs font-bold ${pendingCount > 0 ? "text-amber-600/70" : "text-gray-400"}`}>
        {pendingCount > 0 ? t("home.requiresReview") : t("home.noPending")}
      </p>
    </div>
  </>
);

const UserKpis = ({ activeCount, rejectedCount, t }: { activeCount: number; rejectedCount: number; t: any }) => (
  <>
    <StatCard
      title={t("home.activeTrips")}
      value={activeCount.toString()}
      icon={<Plane className="w-5 h-5" />}
      subtitle={t("home.activeTripsSubtitle")}
    />
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${rejectedCount > 0 ? "bg-accent/5 border-accent/20" : "bg-white border-gray-100"}`}>
      {rejectedCount > 0 && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${rejectedCount > 0 ? "text-accent/70" : "text-gray-400"}`}>
          {t("home.rejectedItems")}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rejectedCount > 0 ? "bg-accent/10 text-accent" : "bg-gray-50 text-gray-300"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${rejectedCount > 0 ? "text-accent" : "text-dark"}`}>
        {rejectedCount}
      </h3>
      <p className={`relative z-10 text-xs font-bold ${rejectedCount > 0 ? "text-accent/60" : "text-gray-400"}`}>
        {rejectedCount > 0 ? t("home.requiresAttention") : t("home.noIncidents")}
      </p>
    </div>
  </>
);

const KpisGrid = ({
  amounts, reportsByStatus, showTeamStats, teamMemberCount, t
}: {
  amounts: any; reportsByStatus: any; showTeamStats: boolean; teamMemberCount: number; t: any
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
      <TeamKpis 
        teamMemberCount={teamMemberCount} 
        pendingCount={reportsByStatus.pending.length} 
        t={t} 
      />
    ) : (
      <UserKpis 
        activeCount={reportsByStatus.active.length} 
        rejectedCount={amounts.rejectedCount} 
        t={t} 
      />
    )}
  </div>
);

const MainDashboardGrid = ({
  showTeamStats, canApprove, reportsByStatus, currentTrip, navigate, dateLocale, t, amounts
}: {
  showTeamStats: boolean; canApprove: boolean; reportsByStatus: any; currentTrip: any; navigate: any; dateLocale: Locale; t: any; amounts: any
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
    <section className="lg:col-span-2 space-y-5">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
          {showTeamStats ? <Clock className="w-4 h-4 text-brand" /> : <TrendingUp className="w-4 h-4 text-brand" />}
        </div>
        {(() => {
          if (showTeamStats) return canApprove ? t("home.pendingApprovals") : t("home.teamReports");
          return t("home.activeTrip");
        })()}
      </h2>

      {(() => {
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
          return (
            <ActiveTripCard
              currentTrip={currentTrip}
              navigate={navigate}
              dateLocale={dateLocale}
              t={t}
            />
          );
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
      })()}
    </section>

    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {t("home.recentActivity")}
        </h2>
        <button onClick={() => navigate("/trips")} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline underline-offset-2">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right">
                    <span className="font-black text-dark text-sm block leading-none">
                      {report.approved_amount || report.requested_amount}
                      <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                    </span>
                  </div>
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

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading: reportsLoading } = useReportsQuery();
  const { data: users } = useUsersQuery();
  const { isSelf } = useScope();
  const { can } = usePermissions();

  const data = useMemo(() => {
    if (!reports) return null;
    return {
      reportsByStatus: getReportsSummary(reports),
      amounts: getAmountsSummary(reports),
      currentTrip: getReportsSummary(reports).active.find((r) => r.status.toUpperCase() !== "SUBMITTED") || null,
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

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
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
