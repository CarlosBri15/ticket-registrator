import { useMemo, useState } from "react";
import {
  useReportsQuery,
  useReportsPaginatedQuery,
  useReportFilterState,
  useScope,
  useUserQuery,
  AUTHORITY_LEVELS,
  ReportStatus,
} from "@ticket-registrator/shared";
import { Plus, Search, FileText, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableHeader } from "../../../components/ui/TableHeader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ReportForm } from "../components/ReportForm";
import { ReportCard } from "../components/ReportCard";
import { ReportRowItem } from "../components/ReportRow";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportSkeletonCard } from "../components/ReportSkeletonCard";
import { ACTIVE_STATUSES, isCurrentReport } from "../constants";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { REPORT_GRID, REPORT_GRID_WITH_OWNER } from "../../../constants/gridLayouts";

const PAGE_SIZE = 5;

export const ReportsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = useDateLocale();
  const { isSelf } = useScope();
  const { data: currentUser } = useUserQuery();
  const showOwner = !isSelf;
  const tableGrid = showOwner ? REPORT_GRID_WITH_OWNER : REPORT_GRID;

  // Supervisors (Manager, Controller) never create their own reports — they
  // only review subordinates'. Landing them on the SUBMITTED queue mirrors
  // that workflow. Admin / SuperAdmin keep the unfiltered "ALL" default since
  // they're auditors and should see every status without an explicit filter.
  const isSupervisor =
    !!currentUser &&
    currentUser.hierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
    currentUser.hierarchy < AUTHORITY_LEVELS.COMPANY;
  const defaultStatusFilter = isSupervisor ? ReportStatus.SUBMITTED : "ALL";

  const {
    search, setSearch,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    hasActiveFilters, clearFilters,
  } = useReportFilterState({ defaultStatusFilter });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change — derived state pattern (no effect).
  // dateRange is a fresh object on every render, so we serialise it for stable
  // comparison.
  const filtersKey = `${search}|${statusFilter}|${dateRange?.start?.toISOString() ?? ""}|${dateRange?.end?.toISOString() ?? ""}`;
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (prevFiltersKey !== filtersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const { data: allReports, isLoading: isLoadingCurrent } = useReportsQuery();

  // The "active report" hero is the user's own in-progress draft. Only
  // Employees create reports — for any role above (Manager, Controller, Admin,
  // SuperAdmin) the hero is hidden, since they only supervise/audit and the
  // active reports in `allReports` belong to other users.
  const currentReport = useMemo(() => {
    if (!isSelf) return null;
    return (
      allReports?.find(
        (r) => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r),
      ) ?? null
    );
  }, [allReports, isSelf]);

  const paginationParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    name: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    startDate: dateRange?.start ? dateRange.start.toISOString().split("T")[0] : undefined,
    endDate: dateRange?.end ? dateRange.end.toISOString().split("T")[0] : undefined,
  }), [page, search, statusFilter, dateRange]);

  const { data: paginatedData, isLoading: isLoadingList } = useReportsPaginatedQuery(paginationParams);

  const listReports = useMemo(
    () => paginatedData?.data.filter((r) => r.id !== currentReport?.id) ?? [],
    [paginatedData, currentReport],
  );

  const isLoading = isLoadingCurrent || isLoadingList;
  const totalItems = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;
  const hasAnyReports = (allReports?.length ?? 0) > 0;

  const stats = useMemo(() => {
    if (isLoading || !hasAnyReports) return undefined;
    const items = [
      {
        label: t("trips.total", "Total"),
        value: totalItems,
        icon: <FileText className="w-4 h-4" aria-hidden={true} />,
      },
    ];
    if (currentReport) {
      items.push({
        label: t("home.activeTrip"),
        value: 1,
        icon: <Activity className="w-4 h-4" aria-hidden={true} />,
      });
    }
    return items;
  }, [isLoading, hasAnyReports, totalItems, currentReport, t]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("trips.title")}
        stats={stats}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t("trips.new")}
          </Button>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("trips.newTripTitle")}>
        <ReportForm
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* ── Empty state ── */}
      {!isLoading && !hasAnyReports && (
        <EmptyState
          icon={<FileText className="w-4 h-4" aria-hidden={true} />}
          title={t("trips.noTickets")}
          description={t("trips.primerViajeDesc")}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsModalOpen(true)}
            >
              {t("home.createFirst")}
            </Button>
          }
        />
      )}

      {/* ── Active report (this app's UX value-add over the kit pattern) ── */}
      {!isLoading && currentReport && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-sans-semibold text-dark/45">
            {t("home.activeTrip")}
          </p>
          <ReportCard
            report={currentReport}
            onClick={() => navigate(`/reports/${currentReport.id}`)}
            dateLocale={dateLocale}
          />
        </div>
      )}

      {/* ── Reports list (filters + table) ── */}
      {(!isLoading || hasAnyReports) && (totalItems > 0 || hasActiveFilters || isLoading) && (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-sans-semibold text-dark/45">
            {t("trips.title")}
          </p>

          {hasAnyReports && (
            // Render the filter bar regardless of `isLoading` — unmounting it
            // during the in-flight pagination fetch caused the search input to
            // lose focus on every keystroke (filter change → setPage(1) →
            // refetch → !isLoading=false → <ReportFilterBar/> remount).
            <ReportFilterBar
              search={search}
              onSearch={setSearch}
              statusFilter={statusFilter}
              onStatus={setStatusFilter}
              dateRange={dateRange}
              onDateRange={setDateRange}
              hasFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          )}

          <div className="w-full rounded-[14px] border border-[var(--color-border-main)] bg-surface-card-soft overflow-hidden">
            <TableHeader
              gridTemplate={tableGrid}
              columns={[
                { label: t("reports.tableName") },
                ...(showOwner ? [{ label: t("reports.tableOwner") }] : []),
                { label: t("reports.tableStatus"), align: "center" as const },
                { label: t("reports.tableDates"), align: "center" as const },
                { label: t("reports.tableAmount"), align: "right" as const },
              ]}
            />

            {isLoading && (
              <>
                <ReportSkeletonCard />
                <ReportSkeletonCard />
                <ReportSkeletonCard />
              </>
            )}

            {!isLoading && listReports.length > 0 && (
              listReports.map((r) => (
                <ReportRowItem
                  key={r.id}
                  report={r}
                  onClick={() => navigate(`/reports/${r.id}`)}
                  dateLocale={dateLocale}
                  showOwner={showOwner}
                />
              ))
            )}

            {!isLoading && listReports.length === 0 && (
              // min-h matches roughly 3 list rows so the empty state slot has
              // a similar visual footprint to a populated list — avoids the
              // abrupt layout collapse when a search filter goes from "has
              // matches" to "no matches".
              <div className="flex flex-col items-center justify-center min-h-[260px] gap-2 text-center border-b border-[var(--color-border-main)]">
                <Search className="w-4 h-4 text-dark/25 mb-1" />
                <p className="font-sans-medium text-[13px] text-dark/55">
                  {t("trips.noResultsFilter")}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-1"
                >
                  {t("trips.filterClearAll")}
                </button>
              </div>
            )}
          </div>

          {!isLoading && listReports.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};
