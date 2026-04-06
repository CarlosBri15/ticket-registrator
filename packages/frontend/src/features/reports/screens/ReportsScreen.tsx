import { useMemo, useState, useEffect } from "react";
import {
  useReportsQuery,
  useReportsPaginatedQuery,
  useReportFilterState,
} from "@ticket-registrator/shared";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { ReportForm } from "../components/ReportForm";
import { ReportCard } from "../components/ReportCard";
import { ReportRowItem } from "../components/ReportRow";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportSkeletonCard } from "../components/ReportSkeletonCard";
import { ReportEmptyState } from "../components/ReportEmptyState";
import { ACTIVE_STATUSES, isCurrentReport } from "../constants";
import { Plus, Search } from "lucide-react";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TableHeader } from "../../../components/ui/TableHeader";

const PAGE_SIZE = 5;

export const ReportsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = useDateLocale();

  const {
    search, setSearch,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    hasActiveFilters, clearFilters,
  } = useReportFilterState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateRange]);

  const { data: allReports, isLoading: isLoadingCurrent } = useReportsQuery();

  const currentReport = useMemo(
    () => allReports?.find((r) => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r)) ?? null,
    [allReports],
  );

  const paginationParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    name: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    startDate: dateRange?.start ? dateRange.start.toISOString().split('T')[0] : undefined,
    endDate: dateRange?.end ? dateRange.end.toISOString().split('T')[0] : undefined,
  }), [page, search, statusFilter, dateRange]);

  const { data: paginatedData, isLoading: isLoadingList } = useReportsPaginatedQuery(paginationParams);

  const listReports = useMemo(
    () => paginatedData?.data.filter((r) => r.id !== currentReport?.id) ?? [],
    [paginatedData, currentReport],
  );

  const isLoading    = isLoadingCurrent || isLoadingList;
  const totalItems   = paginatedData?.total ?? 0;
  const totalPages   = paginatedData?.totalPages ?? 1;
  const hasAnyReports = (allReports?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Título + acciones ── */}
      <div className="flex items-end justify-between pt-1">
        <div className="flex flex-col gap-5">
          <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight">
            {t("trips.title")}
          </h1>

          {!isLoading && hasAnyReports && (
            <div className="flex items-center gap-8">
              <StatItem label={t("trips.total")} value={totalItems} />
              {currentReport && (
                <StatItem label={t("home.activeTrip")} value={1} />
              )}
            </div>
          )}
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t("trips.new")}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("trips.newTripTitle")}>
        <ReportForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* ── Empty state ── */}
      {!isLoading && !hasAnyReports && (
        <ReportEmptyState
          title={t("trips.noTickets")}
          description={t("trips.primerViajeDesc")}
          onAction={() => setIsModalOpen(true)}
          actionLabel={t("home.createFirst")}
        />
      )}

      {/* ── Reporte activo ── */}
      {!isLoading && currentReport && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-sans-semibold text-dark/45">
            {t("home.activeTrip")}
          </p>
          <ReportCard
            report={currentReport}
            onClick={() => navigate(`/reports/${currentReport.id}`)}
            dateLocale={dateLocale}
            isActive
          />
        </div>
      )}

      {/* ── Lista de reportes (filtros + tabla) ── */}
      {(!isLoading || hasAnyReports) && (totalItems > 0 || hasActiveFilters || isLoading) && (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-sans-semibold text-dark/45">
            {t("trips.title")}
          </p>

          {/* Filtros — encima de la tabla, debajo del reporte activo */}
          {!isLoading && hasAnyReports && (
            <ReportFilterBar
              search={search}             onSearch={setSearch}
              statusFilter={statusFilter} onStatus={setStatusFilter}
              dateRange={dateRange as any} onDateRange={setDateRange as any}
              hasFilters={hasActiveFilters} onClear={clearFilters}
            />
          )}

          {/* Tabla sin borde exterior */}
          <div className="w-full">
            <TableHeader 
              columns={[
                { label: t("reports.tableName") },
                { label: t("reports.tableStatus"), align: "center" },
                { label: t("reports.tableDates"), align: "center" },
                { label: t("reports.tableAmount"), align: "right" },
              ]}
            />

            {(() => {
              if (isLoading) {
                return (
                  <>
                    <ReportSkeletonCard />
                    <ReportSkeletonCard />
                    <ReportSkeletonCard />
                  </>
                );
              }
              
              if (listReports.length > 0) {
                return listReports.map((r) => (
                  <ReportRowItem
                    key={r.id}
                    report={r}
                    onClick={() => navigate(`/reports/${r.id}`)}
                    dateLocale={dateLocale}
                  />
                ));
              }

              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
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
              );
            })()}
          </div>

          {listReports.length > 0 && (
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

// ── Sub-components ────────────────────────────────────────────────────────────

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-sans-medium text-dark/45 leading-none">{label}</span>
    <span className="text-[22px] font-sans-bold text-dark leading-none">{value}</span>
  </div>
);


