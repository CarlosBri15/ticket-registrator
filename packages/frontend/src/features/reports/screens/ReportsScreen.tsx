import { useMemo, useState } from "react";
import { useReportsQuery, useReportFilterState } from "@ticket-registrator/shared";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { PixelCard } from "../../../components/ui/PixelCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { ReportForm } from "../components/ReportForm";
import { ReportCard } from "../components/ReportCard";
import { ReportRow } from "../components/ReportRow";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportSkeletonCard } from "../components/ReportSkeletonCard";
import { ReportEmptyState } from "../components/ReportEmptyState";
import type { DateRange } from "@ticket-registrator/shared";
import {
  ACTIVE_STATUSES, PENDING_STATUSES, COMPLETED_STATUSES,
  HISTORY_LIMIT, DARK, BORDER,
  isCurrentReport,
} from "../constants";
import {
  filterBySearch,
  filterByStatus,
  filterByDateRange,
} from "../../../utils/reportAnalytics";
import { Plus, Send, Clock, FileText, Search } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";

export const ReportsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: reports, isLoading } = useReportsQuery();
  const {
    search, setSearch,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    showAllHistory, setShowAllHistory,
    hasActiveFilters, clearFilters,
  } = useReportFilterState();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const dateLocale = useDateLocale();

  const currentReport = useMemo(
    () => reports?.find((r) => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r)) ?? null,
    [reports],
  );

  const allPending = useMemo(
    () => reports?.filter((r) => PENDING_STATUSES.has(r.status.toUpperCase()) && r.id !== currentReport?.id) ?? [],
    [reports, currentReport],
  );

  const allCompleted = useMemo(
    () => reports?.filter((r) => COMPLETED_STATUSES.has(r.status.toUpperCase())) ?? [],
    [reports],
  );

  const filteredPending = useMemo(() => {
    let list = allPending;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(
      list, 
      dateRange?.start ? dateRange.start.toISOString().split('T')[0] : null, 
      dateRange?.end ? dateRange.end.toISOString().split('T')[0] : null
    );
    return list;
  }, [allPending, search, statusFilter, dateRange]);

  const filteredCompleted = useMemo(() => {
    let list = allCompleted;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(
      list, 
      dateRange?.start ? dateRange.start.toISOString().split('T')[0] : null, 
      dateRange?.end ? dateRange.end.toISOString().split('T')[0] : null
    );
    return list;
  }, [allCompleted, search, statusFilter, dateRange]);

  const visibleCompleted = showAllHistory ? filteredCompleted : filteredCompleted.slice(0, HISTORY_LIMIT);
  const hiddenCount = filteredCompleted.length - HISTORY_LIMIT;

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      <div className={tokens.headerPage}>
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("trips.title")}
        </h1>
        <Button
          variant="primary"
          className="w-[160px] whitespace-nowrap"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t("trips.new")}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("trips.newTripTitle")}>
        <ReportForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_420px]">

        {/* ── Left: filters + active report + pending ── */}
        <main className="min-w-0 px-10 md:px-16 pt-4 pb-7 lg:pb-9 space-y-6">

          {!isLoading && (reports?.length ?? 0) > 0 && (
            <ReportFilterBar
              search={search}           onSearch={setSearch}
              statusFilter={statusFilter} onStatus={setStatusFilter}
              dateRange={dateRange}     onDateRange={setDateRange}
              hasFilters={hasActiveFilters} onClear={clearFilters}
            />
          )}

          {!isLoading && !reports?.length && (
            <ReportEmptyState
              title={t("trips.noTickets")}
              description={t("trips.primerViajeDesc")}
              onAction={() => setIsModalOpen(true)}
              actionLabel={t("home.createFirst")}
            />
          )}

          {isLoading && (
            <div className="space-y-2.5">
              <ReportSkeletonCard /><ReportSkeletonCard /><ReportSkeletonCard />
            </div>
          )}

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

          {!isLoading && (filteredPending.length > 0 || (!currentReport && (reports?.length ?? 0) > 0)) && (
            <section>
              <SectionHeader icon={<Send />} title={t("trips.pendingSection")} count={filteredPending.length || undefined} />
              {filteredPending.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredPending.map((r) => (
                    <ReportRow key={r.id} report={r} onClick={() => navigate(`/reports/${r.id}`)} dateLocale={dateLocale} />
                  ))}
                </div>
              ) : hasActiveFilters ? (
                <PixelCard className="w-full">
                  <div className="flex flex-col items-center py-8 gap-2 text-center">
                    <Search className="w-5 h-5" style={{ color: `${DARK}30` }} />
                    <p className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}50` }}>
                      {t("trips.noResultsFilter")}
                    </p>
                    <button type="button" onClick={clearFilters} className="font-space-bold text-brand" style={{ fontSize: 12 }}>
                      {t("trips.filterClearAll")}
                    </button>
                  </div>
                </PixelCard>
              ) : (
                <ReportEmptyState
                  title={t("trips.noActiveTrips")}
                  description={t("trips.primerViajeDesc")}
                  onAction={() => setIsModalOpen(true)}
                  actionLabel={t("home.createFirst")}
                />
              )}
            </section>
          )}
        </main>

        {/* ── Separator ── */}
        <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: BORDER }} />

        {/* ── Right: history ── */}
        <aside className="px-8 md:px-10 py-7 lg:py-9">
          {!isLoading && filteredCompleted.length > 0 ? (
            <section>
              <SectionHeader icon={<Clock />} title={t("trips.history")} count={filteredCompleted.length} />
              <div className="space-y-2.5">
                {visibleCompleted.map((r) => (
                  <ReportRow key={r.id} report={r} onClick={() => navigate(`/reports/${r.id}`)} dateLocale={dateLocale} />
                ))}
              </div>

              {hiddenCount > 0 && !showAllHistory && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory(true)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-space-bold text-dark mt-1"
                  style={{ borderTop: `2px solid ${BORDER}`, fontSize: 12, letterSpacing: "0.3px" }}
                >
                  {t("common.viewAll")}{" "}
                  <span style={{ backgroundColor: DARK, borderRadius: 4, paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, fontWeight: 700, fontSize: 9, color: "#fff" }}>
                    +{hiddenCount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {showAllHistory && filteredCompleted.length > HISTORY_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-space-bold text-dark mt-1"
                  style={{ borderTop: `2px solid ${BORDER}`, fontSize: 12 }}
                >
                  {t("trips.viewLess")} <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
            </section>
          ) : !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <Clock className="w-7 h-7" style={{ color: `${DARK}20` }} />
              <p className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}30` }}>
                {t("trips.history")}
              </p>
              <p className="font-space" style={{ fontSize: 11, color: `${DARK}25` }}>
                {t("trips.historyEmptyDesc")}
              </p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
