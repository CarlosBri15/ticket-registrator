import React, { useMemo, useState } from "react";
import {
  Plus, TrendingUp, Users, CheckCircle, Wallet,
  FileText, ChevronRight, Camera,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { ReportCard } from "../reports/components/ReportCard";
import { ReportRowItem } from "../reports/components/ReportRow";
import {
  useReportsQuery,
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScope,
  useScopeContext,
  usePermissions,
} from "@ticket-registrator/shared";
import type { IReport } from "@ticket-registrator/shared";
import { useNavigate } from "react-router-dom";
import type { Locale } from "date-fns";
import { getReportsSummary, getAmountsSummary } from "./utils";
import { CompanyModeBanner } from "./components/CompanyModeBanner";
import { PendingApprovalsList } from "./components/PendingApprovalsList";
import { QuickActionsGrid } from "./components/QuickActionsGrid";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardHero } from "./components/DashboardHero";
import { PendingStatsCard } from "./components/PendingStatsCard";
import { RecentActivitySection } from "./components/RecentActivitySection";
import { useDashboardHelpers } from "./hooks/useDashboardHelpers";
import { TicketUploadModal } from "../tickets/components/TicketUploadModal";

// ─── Team KPIs (non-self users with approval access) ─────────────────────────

const TeamKpis = ({
  teamMemberCount,
  pendingCount,
  t,
}: {
  teamMemberCount: number;
  pendingCount: number;
  t: (key: string) => string;
}) => (
  <>
    <StatCard
      title={t("home.teamMembers")}
      value={teamMemberCount.toString()}
      icon={<Users className="w-4 h-4" />}
      subtitle={t("home.activeMembers")}
    />
    <PendingStatsCard count={pendingCount} label={t("home.pendingApprovals")} />
  </>
);

// ─── Regular user (isSelf) layout ────────────────────────────────────────────

interface UserDashboardProps {
  currentTrip: IReport | null;
  inReviewReports: IReport[];
  recentCompleted: IReport[];
  firstName: string;
  todayLabel: string;
  navigate: (path: string) => void;
  onUpload: () => void;
  dateLocale: Locale;
  t: (key: string, options?: Record<string, unknown>) => string;
  companyBanner?: React.ReactNode;
}

const UserDashboard = ({
  currentTrip,
  inReviewReports,
  recentCompleted,
  firstName,
  todayLabel,
  navigate,
  onUpload,
  dateLocale,
  t,
  companyBanner,
}: UserDashboardProps) => (
  <div className="flex flex-col gap-10 pb-12">

    {companyBanner}

    {/* Greeting */}
    <div className="flex items-end justify-between pt-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight">
          {firstName}
        </h1>
        <p className="text-[11px] font-sans-medium text-dark/45 capitalize">{todayLabel}</p>
      </div>
    </div>

    {/* Active report */}
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-sans-semibold text-dark/45">{t("home.activeTrip")}</p>
      {currentTrip ? (
        <>
          <ReportCard
            report={currentTrip}
            onClick={() => navigate(`/reports/${currentTrip.id}`)}
            dateLocale={dateLocale}
          />
          <button
            type="button"
            onClick={onUpload}
            className="self-start flex items-center gap-1.5 font-sans-medium text-[12px] text-dark/40 hover:text-dark transition-colors mt-0.5"
          >
            <Camera className="w-3 h-3" />
            {t("home.scanTicket")}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3 py-4">
          <p className="font-sans-normal text-dark/40 text-[13px]">
            {t("trips.noActiveTrips")}
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate("/reports")}
          >
            {t("home.createFirst")}
          </Button>
        </div>
      )}
    </div>

    {/* In review */}
    {inReviewReports.length > 0 && (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-sans-semibold text-dark/45">{t("dashboard.inReview")}</p>
          <span className="text-[11px] font-sans-bold text-dark/25 tabular-nums">
            {inReviewReports.length}
          </span>
        </div>
        <div className="w-full">
          {inReviewReports.map((r) => (
            <ReportRowItem
              key={r.id}
              report={r}
              onClick={() => navigate(`/reports/${r.id}`)}
              dateLocale={dateLocale}
            />
          ))}
        </div>
      </div>
    )}

    {/* Recent completed */}
    {recentCompleted.length > 0 && (
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-sans-semibold text-dark/45">{t("home.recentActivity")}</p>
        <div className="w-full">
          {recentCompleted.map((r) => (
            <ReportRowItem
              key={r.id}
              report={r}
              onClick={() => navigate(`/reports/${r.id}`)}
              dateLocale={dateLocale}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="self-start flex items-center gap-1 font-sans-medium text-[12px] text-dark/40 hover:text-dark transition-colors mt-0.5"
        >
          {t("common.viewAll")}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    )}

  </div>
);

// ─── Main export ──────────────────────────────────────────────────────────────

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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const data = useMemo(() => {
    if (!Array.isArray(reports)) return null;
    const reportsByStatus = getReportsSummary(reports);
    const amounts = getAmountsSummary(reports);
    const currentTrip =
      reportsByStatus.active.find((r) => r.status.toUpperCase() !== "SUBMITTED") || null;

    const inReviewReports = reports.filter((r) =>
      ["SUBMITTED", "PENDING"].includes(r.status.toUpperCase()),
    );

    return {
      reportsByStatus,
      amounts,
      currentTrip,
      teamMemberCount: users?.length ?? 0,
      inReviewReports,
      inReviewCount: inReviewReports.length,
      inReviewAmount: inReviewReports.reduce((acc: number, r) => acc + (r.requested_amount ?? 0), 0),
      recentCompleted: reports
        .filter((r) => ["APPROVED", "PAID", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()))
        .slice(0, 4),
    };
  }, [reports, users]);

  if (reportsLoading || !data) return <DashboardSkeleton />;

  const {
    reportsByStatus, amounts, currentTrip,
    teamMemberCount, inReviewReports, recentCompleted,
  } = data;

  const firstName = user?.name?.split(" ")[0] || t("layout.defaultUser");
  const showManagementLinks = can("view_users") || can("view_departments") || can("view_roles");
  const isCompanyMode = isGlobal && !!activeCompanyId;
  const activeOrg = orgs?.find((o) => o.id === activeCompanyId);

  // ── Regular user (self) → mobile-style layout ──────────────────────────────
  if (isSelf) {
    return (
      <>
        <UserDashboard
          currentTrip={currentTrip}
          inReviewReports={inReviewReports}
          recentCompleted={recentCompleted}
          firstName={firstName}
          todayLabel={new Date().toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" })}
          navigate={navigate}
          onUpload={() => setIsUploadModalOpen(true)}
          dateLocale={dateLocale}
          t={t}
          companyBanner={
            isCompanyMode ? (
              <CompanyModeBanner
                orgName={activeOrg?.name ?? t("layout.defaultOrg")}
                onExit={() => setActiveCompanyId(null)}
                onDetail={() => navigate(`/organizations/${activeCompanyId}`)}
              />
            ) : undefined
          }
        />
        {currentTrip && (
          <TicketUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            reportId={currentTrip.id}
          />
        )}
      </>
    );
  }

  // ── Team / approval role → existing layout ─────────────────────────────────
  const canApprove = can("approve_reports");
  const dashboardMainContent = canApprove ? (
    <PendingApprovalsList
      reports={reportsByStatus.pending}
      navigate={navigate}
      dateLocale={dateLocale}
      t={t}
      title={t("home.pendingApprovals")}
    />
  ) : (
    <PendingApprovalsList
      reports={reportsByStatus.active}
      navigate={navigate}
      dateLocale={dateLocale}
      t={t}
      title={t("home.teamReports")}
    />
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {isCompanyMode && (
        <CompanyModeBanner
          orgName={activeOrg?.name ?? t("layout.defaultOrg")}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          variant="primary"
          title={t("home.pendingReimbursement")}
          value={`${amounts.pending.toFixed(2)} €`}
          icon={<Wallet className="w-4 h-4" />}
          trend={amounts.pending > 0 ? t("home.inProcess") : t("home.upToDate")}
          trendUp={false}
        />
        <TeamKpis
          teamMemberCount={teamMemberCount}
          pendingCount={reportsByStatus.pending.length}
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {amounts.approved > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-green-100 bg-green-50/50">
              <div className="w-9 h-9 rounded-md bg-green-100 flex items-center justify-center text-success shrink-0">
                <CheckCircle className="w-4 h-4" aria-hidden={true} />
              </div>
              <div>
                <p className="text-[11px] font-sans-semibold uppercase tracking-wide text-success">
                  {t("home.totalApproved")}
                </p>
                <p className="text-[18px] font-sans-bold text-success leading-none mt-0.5 tabular-nums">
                  {amounts.approved.toFixed(2)} €
                </p>
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
