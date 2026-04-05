import { useMemo, useState, useEffect } from "react";
import {
  useReportsQuery,
  useReportsPaginatedQuery,
  useReportFilterState,
} from "@ticket-registrator/shared";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { PixelCard } from "../../../components/ui/PixelCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Pagination } from "../../../components/ui/Pagination";
import { ReportForm } from "../components/ReportForm";
import { ReportCard } from "../components/ReportCard";
import { ReportRow } from "../components/ReportRow";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportSkeletonCard } from "../components/ReportSkeletonCard";
import { ReportEmptyState } from "../components/ReportEmptyState";
import { ACTIVE_STATUSES, DARK, isCurrentReport } from "../constants";
import { Plus, FileText, List, Search } from "lucide-react";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";

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

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => { setPage(1); }, [search, statusFilter, dateRange]);

  // Query ligera solo para detectar el reporte en curso
  const { data: allReports, isLoading: isLoadingCurrent } = useReportsQuery();

  const currentReport = useMemo(
    () => allReports?.find((r) => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r)) ?? null,
    [allReports],
  );

  // Lista paginada con filtros
  const paginationParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    name: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    startDate: dateRange?.start ? dateRange.start.toISOString().split('T')[0] : undefined,
    endDate: dateRange?.end ? dateRange.end.toISOString().split('T')[0] : undefined,
  }), [page, search, statusFilter, dateRange]);

  const { data: paginatedData, isLoading: isLoadingList } = useReportsPaginatedQuery(paginationParams);

  // Excluir el reporte en curso de la lista
  const listReports = useMemo(
    () => paginatedData?.data.filter((r) => r.id !== currentReport?.id) ?? [],
    [paginatedData, currentReport],
  );

  const isLoading = isLoadingCurrent || isLoadingList;
  const totalItems = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      {/* ── Header ── */}
      <div className={tokens.headerPage}>
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("trips.title")}
        </h1>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t("trips.new")}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("trips.newTripTitle")}>
        <ReportForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* ── Content ── */}
      <div className="w-full max-w-5xl mx-auto px-8 md:px-16 pt-6 pb-12 space-y-6">

        {/* Filters */}
        {!isLoading && (allReports?.length ?? 0) > 0 && (
          <ReportFilterBar
            search={search}             onSearch={setSearch}
            statusFilter={statusFilter} onStatus={setStatusFilter}
            dateRange={dateRange}       onDateRange={setDateRange}
            hasFilters={hasActiveFilters} onClear={clearFilters}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            <ReportSkeletonCard /><ReportSkeletonCard /><ReportSkeletonCard />
          </div>
        )}

        {/* Empty total */}
        {!isLoading && !allReports?.length && (
          <ReportEmptyState
            title={t("trips.noTickets")}
            description={t("trips.primerViajeDesc")}
            onAction={() => setIsModalOpen(true)}
            actionLabel={t("home.createFirst")}
          />
        )}

        {/* Reporte en curso */}
        {!isLoading && currentReport && (
          <section>
            <SectionHeader icon={<FileText />} title={t("home.activeTrip")} />
            <ReportCard
              report={currentReport}
              onClick={() => navigate(`/reports/${currentReport.id}`)}
              dateLocale={dateLocale}
            />
          </section>
        )}

        {/* Lista paginada */}
        {!isLoading && (totalItems > 0 || hasActiveFilters) && (
          <section>
            <SectionHeader
              icon={<List />}
              title="Lista de reportes"
              count={totalItems}
            />

            {listReports.length > 0 ? (
              <>
                <div className="space-y-2">
                  {listReports.map((r) => (
                    <ReportRow
                      key={r.id}
                      report={r}
                      onClick={() => navigate(`/reports/${r.id}`)}
                      dateLocale={dateLocale}
                    />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <PixelCard className="w-full">
                <div className="flex flex-col items-center py-8 gap-2 text-center">
                  <Search className="w-5 h-5" style={{ color: `${DARK}30` }} />
                  <p className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}50` }}>
                    {t("trips.noResultsFilter")}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-space-bold text-brand"
                    style={{ fontSize: 12 }}
                  >
                    {t("trips.filterClearAll")}
                  </button>
                </div>
              </PixelCard>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
