import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Pencil,
  Plane,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  useUsersQuery,
  useReportsQuery,
  useRolesQuery,
  useDepartmentsQuery,
  useScope,
  useScopeContext,
  useUserQuery,
  useSystemRolesQuery,
  ReportStatus,
  useReportFilterState,
} from "@ticket-registrator/shared";
import { EditUserModal } from "../components/EditUserModal";
import { Button } from "../../../components/ui/Button";
import { ReportRow } from "../../reports/components/ReportRow";
import { ReportCard } from "../../reports/components/ReportCard";
import { ReportFilterBar } from "../../reports/components/ReportFilterBar";
import { UserDetailIdentity } from "../components/UserDetailIdentity";
import { UserDetailRating } from "../components/UserDetailRating";
import { UserDetailSidebar } from "../components/UserDetailSidebar";
import {
  filterBySearch,
  filterByStatus,
  filterByDateRange,
} from "@ticket-registrator/shared";
import { BORDER } from "../constants";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";

export const UserDetailScreen = () => {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    search, setSearch,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    hasActiveFilters, clearFilters,
  } = useReportFilterState();

  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { data: currentUser } = useUserQuery();
  const companyId = isGlobal ? activeCompanyId : (currentUser?.companyId ?? null);

  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: allReports, isLoading: loadingReports } = useReportsQuery();
  const { data: companyRoles } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles } = useSystemRolesQuery();
  const roles = useMemo(() => {
    const combined = [...(systemRoles || [])];
    (companyRoles || []).forEach(r => {
      if (!combined.some(s => s.id === r.id)) combined.push(r);
    });
    return combined;
  }, [systemRoles, companyRoles]);
  const { data: departments } = useDepartmentsQuery(companyId ?? undefined);

  const user = users?.find((u) => u.id === userId);
  const userReports = allReports?.filter((r) => r.user_id === userId) ?? [];

  const isLoading = loadingUsers || loadingReports;

  // ── Active vs History Logic ───────
  const activeReport = useMemo(() => {
    const today = new Date();
    return userReports.find(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return today >= start && today <= end;
    });
  }, [userReports]);

  const historyReports = useMemo(() => {
    let list = [...userReports]
      .filter(r => r.id !== activeReport?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(
      list,
      dateRange?.start ? dateRange.start.toISOString().split('T')[0] : null,
      dateRange?.end ? dateRange.end.toISOString().split('T')[0] : null
    );
    return list;
  }, [userReports, activeReport, search, statusFilter, dateRange]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-dark/5 rounded-full" />
        <div className="h-[200px] w-full bg-dark/5 rounded-[20px]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-dark/5 rounded-[20px]" />)}
        </div>
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <User className="w-14 h-14 text-slate-200 mb-4" />
        <h2 className="text-xl font-space-bold text-dark mb-2">Usuario no encontrado</h2>
        <p className="text-dark/40 font-space mb-6">El usuario que buscas no existe o fue eliminado.</p>
        <Button
          variant="secondary"
          onClick={() => navigate("/users")}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  const roleName = roles?.find(r => r.id === user.roleId)?.name ?? "—";
  const userDepts = departments?.filter((d) => user.departmentIds?.includes(d.id)) ?? [];

  const totalReports = userReports.length;
  const totalApproved = userReports
    .filter((r) => r.status.toUpperCase() === ReportStatus.APPROVED.toUpperCase())
    .reduce((acc, r) => acc + (r.approved_amount ?? 0), 0);


  // ── Stats Calculation ─────────────
  const avgApproved = totalReports > 0 ? (totalApproved / totalReports).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";
  
  // Rating logic (MOCK)
  const ratingValue = 92; // 0 - 100
  const ratingColor = ratingValue >= 80
    ? "var(--color-success, #22C55E)"
    : ratingValue >= 50
      ? "#EAB308"
      : "#EF4444";
  const ratingLabel = ratingValue >= 80
    ? "Excelente"
    : ratingValue >= 50
      ? "Aceptable"
      : "Bajo";

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9 space-y-0 animate-in fade-in duration-500 pb-20">

      {/* ── Header Area ── */}
      <div className="bg-[var(--color-surface-header)] border-b-4 border-[var(--color-shadow-main)] px-10 md:px-16 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => navigate("/users")}
            className="font-space-bold text-dark/30 hover:text-dark transition-colors shrink-0"
            style={{ fontSize: 24, letterSpacing: "0.5px" }}
          >
            {t("users.title")}
          </button>

          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-dark/20 shrink-0" />

          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-space-bold text-dark truncate" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
              {user?.name} {user?.surname}
            </h1>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsEditOpen(true)}
          leftIcon={<Pencil className="w-4 h-4" />}
          className="w-[140px]"
        >
          {t("common.edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_420px]">
          
          {/* ────── MAIN COLUMN ────── */}
          <div className="min-w-0 px-10 md:px-16 pt-7 space-y-8">
            
            <UserDetailIdentity
              user={user}
              roleName={roleName}
              userDepts={userDepts}
            />

            {/* ── Active Report (If Exists) ── */}
            {activeReport && (
              <section className="flex flex-col gap-2">
                <p className="text-[11px] font-sans-semibold text-dark/45">
                  {t("home.activeTrip")}
                </p>
                <ReportCard
                  report={activeReport}
                  onClick={() => navigate(`/reports/${activeReport.id}`)}
                  dateLocale={dateLocale}
                />
              </section>
            )}

            <section className="flex flex-col gap-3 pb-12">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-sans-semibold text-dark/45">
                  {t("users.reportsHistory", "Historial de Reportes")}
                </p>
                <span className="text-[11px] font-sans-bold text-dark/25 tabular-nums">
                  {historyReports.length}
                </span>
              </div>
              
              <div className="pb-2">
                <ReportFilterBar
                  search={search}           onSearch={setSearch}
                  statusFilter={statusFilter} onStatus={setStatusFilter}
                  dateRange={dateRange}     onDateRange={setDateRange}
                  hasFilters={hasActiveFilters} onClear={clearFilters}
                />
              </div>

              <div className="space-y-2.5">
                {historyReports.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-2 text-center border border-[var(--color-border-main)] rounded-lg bg-[var(--color-surface-card)]">
                    <Plane className="w-4 h-4 text-dark/25" aria-hidden={true} />
                    <p className="font-sans-medium text-[13px] text-dark/55">
                      {t("users.noHistory", "Sin historial registrado")}
                    </p>
                  </div>
                ) : (
                  historyReports.map((report) => (
                    <ReportRow 
                      key={report.id} 
                      report={report} 
                      onClick={() => navigate(`/reports/${report.id}`)} 
                      dateLocale={dateLocale}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── Separator ── */}
          <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: BORDER }} />

          {/* ────── SIDEBAR COLUMN ────── */}
          <aside className="px-8 md:px-10 py-7 space-y-6">
            <UserDetailRating
              ratingValue={ratingValue}
              ratingColor={ratingColor}
              ratingLabel={ratingLabel}
            />
            {userId && (
              <UserDetailSidebar
                totalReports={totalReports}
                avgApproved={avgApproved}
                userId={userId}
              />
            )}
          </aside>
        </div>

      {isEditOpen && user && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
          companyId={companyId}
        />
      )}
    </div>
  );
};
