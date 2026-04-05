import React, { useMemo, useState } from "react";
import {
  Plus, Clock, FileText, TrendingUp, Users,
  CheckCircle, Wallet, Plane, ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { PixelCard } from "../../components/ui/PixelCard";
import { userIcon } from "@ticket-registrator/shared/assets";
import { nbTokens } from "@ticket-registrator/shared";
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
import { tokens, radius } from "../../styles/theme";
import { TicketUploadModal } from "../tickets/components/TicketUploadModal";
import { ReportCard } from "../reports/components/ReportCard";
import { ReportRow } from "../reports/components/ReportRow";
import { DARK, BORDER } from "../reports/constants";

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
  inReviewCount: number;
  inReviewAmount: number;
  recentCompleted: IReport[];
  firstName: string;
  navigate: (path: string) => void;
  onUpload: () => void;
  dateLocale: Locale;
  t: (key: string, options?: Record<string, unknown>) => string;
  companyBanner?: React.ReactNode;
}

const UserDashboard = ({
  currentTrip,
  inReviewCount,
  inReviewAmount,
  recentCompleted,
  firstName,
  navigate,
  onUpload,
  dateLocale,
  t,
  companyBanner,
}: UserDashboardProps) => (
  <div className={`-mx-6 md:-mx-10 ${companyBanner ? "" : "-mt-7 lg:-mt-9"}`}>

    {companyBanner && <div className="px-10 md:px-16 pt-4">{companyBanner}</div>}

    <div className={tokens.headerPage}>
      <span className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
        {firstName}
      </span>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigate("/settings")}
        className="!bg-[#E8E8FF]"
      >
        <img src={userIcon} alt="avatar" className="w-10 h-10 object-contain" />
      </Button>
    </div>

    {/* Two-column grid */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_420px]">

      {/* Left: active report + in-review stats */}
      <main className="min-w-0 px-10 md:px-16 pt-4 pb-7 lg:pb-9 space-y-6">

        <section>
          <SectionHeader icon={<FileText />} title={t("home.activeTrip")} />
          {currentTrip ? (
            <ReportCard
              report={currentTrip}
              onClick={() => navigate(`/reports/${currentTrip.id}`)}
              onUpload={onUpload}
              uploadLabel={t("home.scanTicket")}
              dateLocale={dateLocale}
            />
          ) : (
            <PixelCard shadowOffset={3} bg="var(--color-surface-card)" className="w-full">
              <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
                <div
                  style={{
                    width: 52, height: 52,
                    backgroundColor: "#3B82F6",
                    border: "2px solid #2563EB",
                    borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `${nbTokens.shadowBadge}px ${nbTokens.shadowBadge}px 0px #1E40AF`,
                  }}
                >
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>
                  {t("trips.noActiveTrips")}
                </p>
                <p className="font-space" style={{ fontSize: 12, color: `${DARK}40`, maxWidth: 260, lineHeight: 1.6 }}>
                  {t("trips.primerViajeDesc")}
                </p>
                <Button
                  onClick={() => navigate("/reports")}
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  {t("home.createFirst")}
                </Button>
              </div>
            </PixelCard>
          )}
        </section>

        {/* En revisión */}
        <section>
          <SectionHeader
            icon={<Clock />}
            title={t("dashboard.inReview")}
            count={inReviewCount > 0 ? inReviewCount : undefined}
          />
          <PixelCard bg="#FFC83D" className="w-full">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="font-space-bold text-dark" style={{ fontSize: 36, letterSpacing: "-1px", lineHeight: 1 }}>
                    {inReviewCount}
                  </span>
                  <span className="font-space-bold" style={{ fontSize: 10, color: `${DARK}60`, letterSpacing: "0.3px" }}>
                    {t("dashboard.report", { count: inReviewCount })}
                  </span>
                </div>
                <div style={{ width: 2, height: 48, backgroundColor: `${DARK}30` }} />
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="font-space-bold text-dark" style={{ fontSize: 36, letterSpacing: "-1px", lineHeight: 1 }}>
                    {inReviewAmount.toFixed(0)}€
                  </span>
                  <span className="font-space-bold" style={{ fontSize: 10, color: `${DARK}60`, letterSpacing: "0.3px" }}>
                    {t("dashboard.pendingAmount")}
                  </span>
                </div>
              </div>
            </div>
          </PixelCard>
        </section>
      </main>

      {/* Separator */}
      <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: BORDER }} />

      {/* Right: recent history */}
      <aside className="px-8 md:px-10 py-7 lg:py-9">
        {recentCompleted.length > 0 ? (
          <section>
            <SectionHeader icon={<Clock />} title={t("home.recentActivity")} count={recentCompleted.length} />
            <div className="space-y-2.5">
              {recentCompleted.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  onClick={() => navigate(`/reports/${r.id}`)}
                  dateLocale={dateLocale}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/reports")}
              className="w-full mt-1 border-t-2 border-border-main rounded-none"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              {t("common.viewAll")}
            </Button>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <Clock className="w-7 h-7" style={{ color: `${DARK}20` }} />
            <p className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}30` }}>
              {t("home.recentActivity")}
            </p>
            <p className="font-space" style={{ fontSize: 11, color: `${DARK}25` }}>
              {t("trips.noCompletedTrips")}
            </p>
          </div>
        )}
      </aside>
    </div>
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
      inReviewCount: inReviewReports.length,
      inReviewAmount: inReviewReports.reduce((acc: number, r) => acc + (r.requested_amount ?? 0), 0),
      recentCompleted: reports
        .filter((r) => ["APPROVED", "PAID", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()))
        .slice(0, 5),
    };
  }, [reports, users]);

  if (reportsLoading || !data) return <DashboardSkeleton />;

  const {
    reportsByStatus, amounts, currentTrip,
    teamMemberCount, inReviewCount, inReviewAmount, recentCompleted,
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
          inReviewCount={inReviewCount}
          inReviewAmount={inReviewAmount}
          recentCompleted={recentCompleted}
          firstName={firstName}
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
            <div className={`bg-success/5 border border-success/20 ${radius.card} p-5 flex items-center justify-between`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 bg-success/10 ${radius.sm} flex items-center justify-center text-success`}>
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
