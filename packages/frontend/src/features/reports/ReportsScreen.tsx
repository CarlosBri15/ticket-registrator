import { useState, useMemo } from "react";
import { useReportsQuery } from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { ReportForm } from "./components/ReportForm";
import {
  Plus, Calendar, ArrowUpRight, Clock, CheckCircle, FileText, Wallet,
  ChevronRight, BarChart3, MapPin, Search, X, Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  filterBySearch,
  filterByStatus,
  filterByDateRange,
} from "../../utils/reportAnalytics";
import { tokens, radius } from "../../styles/design-tokens";

// ---------- Status filter chips ----------

const STATUS_OPTIONS = ["ALL", "CREATED", "SUBMITTED", "APPROVED", "DECLINED"];

// ---------- Skeleton loaders ----------

const SkeletonCard = () => (
  <div className={tokens.skeletonCard}>
    <div className="flex justify-between items-start mb-5">
      <div className={`h-5 w-20 ${tokens.skeleton} ${radius.full}`} />
      <div className={`h-4 w-16 ${tokens.skeleton} ${radius.full}`} />
    </div>
    <div className={`h-7 w-3/4 ${tokens.skeleton} ${radius.base} mb-4`} />
    <div className="flex gap-2.5 mb-5">
      <div className={`h-7 w-32 ${tokens.skeleton} ${radius.base}`} />
      <div className={`h-7 w-20 ${tokens.skeleton} ${radius.base}`} />
    </div>
    <div className="pt-5 border-t border-slate-100 flex justify-between items-center">
      <div>
        <div className={`h-3 w-20 ${tokens.skeleton} ${radius.sm} mb-2`} />
        <div className={`h-7 w-28 ${tokens.skeleton} ${radius.base}`} />
      </div>
      <div className={`h-9 w-28 ${tokens.skeleton} ${radius.base}`} />
    </div>
  </div>
);

const SkeletonSidebar = () => (
  <div className="space-y-4 animate-pulse">
    <div className={`bg-white ${radius.card} border border-slate-200 p-5 space-y-3`}>
      <div className={`h-14 ${tokens.skeleton} ${radius.base}`} />
      <div className={`h-14 ${tokens.skeleton} ${radius.base}`} />
    </div>
    <div className={`bg-white ${radius.card} border border-slate-200 overflow-hidden`}>
      <div className="p-5 border-b border-slate-100">
        <div className={`h-3 w-16 ${tokens.skeleton} ${radius.sm}`} />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 flex justify-between items-center border-b border-slate-50">
          <div className="space-y-1.5">
            <div className={`h-4 w-28 ${tokens.skeleton} ${radius.sm}`} />
            <div className={`h-3 w-16 ${tokens.skeleton} ${radius.sm}`} />
          </div>
          <div className={`h-4 w-14 ${tokens.skeleton} ${radius.sm}`} />
        </div>
      ))}
    </div>
  </div>
);

// ---------- Filter bar ----------

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
}

const FilterBar = ({
  search, onSearchChange,
  statusFilter, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  hasActiveFilters, onClear,
  totalCount, filteredCount,
}: FilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-white ${radius.card} border border-slate-200 shadow-sm p-4 space-y-3`}>
      {/* Row 1: Search + active filter badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("trips.filterSearch")}
            className={tokens.searchInput}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="clear-search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className={`flex items-center gap-1.5 px-3 py-2 ${radius.base} text-xs font-semibold text-danger border border-danger/20 bg-danger/5 hover:bg-danger/10 transition-colors whitespace-nowrap`}
          >
            <X className="w-3 h-3" />
            {t("trips.filterClearAll")}
          </button>
        )}
      </div>

      {/* Row 2: Status chips + date range */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={`${tokens.chip} ${statusFilter === s ? tokens.chipActive : tokens.chipInactive}`}
          >
            {s === "ALL" ? t("trips.filterAll") : t(`status.${s}`)}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 bg-slate-50 border border-slate-200 ${radius.base} px-3 py-1.5`}>
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {t("trips.filterDateFrom")}
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="text-[11px] font-medium text-dark bg-transparent focus:outline-none cursor-pointer w-24"
            />
          </div>
          <span className="text-slate-300 text-xs">—</span>
          <div className={`flex items-center gap-1.5 bg-slate-50 border border-slate-200 ${radius.base} px-3 py-1.5`}>
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {t("trips.filterDateTo")}
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="text-[11px] font-medium text-dark bg-transparent focus:outline-none cursor-pointer w-24"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-[11px] font-medium text-slate-400">
          {t("trips.filterResultsCount", { count: filteredCount })}{" "}
          <span className="text-slate-300">/ {totalCount}</span>
        </p>
      )}
    </div>
  );
};

// ---------- Main Screen ----------

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reports, isLoading } = useReportsQuery();
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  const hasActiveFilters = !!(search.trim() || statusFilter !== "ALL" || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const allActive = useMemo(
    () => reports?.filter(r => ["CREATED", "DRAFT", "PENDING", "SUBMITTED"].includes(r.status.toUpperCase())) || [],
    [reports],
  );
  const allCompleted = useMemo(
    () => reports?.filter(r => ["APPROVED", "PAID", "REJECTED", "DECLINED"].includes(r.status.toUpperCase())) || [],
    [reports],
  );

  const filteredActive = useMemo(() => {
    let list = allActive;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(list, dateFrom || null, dateTo || null);
    return list;
  }, [allActive, search, statusFilter, dateFrom, dateTo]);

  const filteredCompleted = useMemo(() => {
    let list = allCompleted;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(list, dateFrom || null, dateTo || null);
    return list;
  }, [allCompleted, search, statusFilter, dateFrom, dateTo]);

  const historyStats = {
    totalCompleted: filteredCompleted.length,
    totalSpent: filteredCompleted.reduce((acc, curr) => acc + (curr.approved_amount || 0), 0),
  };

  const totalFiltered = filteredActive.length + filteredCompleted.length;
  const totalAll = (reports?.length ?? 0);

  const renderActiveTrips = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }

    if (filteredActive.length > 0) {
      return (
        <div className="space-y-3">
          {filteredActive.map((report, idx) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className={`w-full text-left group relative bg-white ${radius.card} border p-6 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-200 cursor-pointer overflow-hidden ${idx === 0 ? "border-brand/20" : "border-slate-200"}`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={report.status} size="md" />
                  <span className={`bg-slate-50 px-2.5 py-1 ${radius.full} text-[10px] font-mono text-slate-400 border border-slate-200`}>
                    #{(report.id || "").substring(0, 8)}
                  </span>
                </div>

                <h3 className={`font-semibold text-dark mb-3 leading-tight group-hover:text-brand transition-colors duration-200 ${idx === 0 ? "text-xl" : "text-lg"}`}>
                  {report.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                  <span className={`flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 ${radius.base} text-xs font-medium text-slate-500 border border-slate-200`}>
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })} — {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </span>
                  {report.type && (
                    <span className={`flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 ${radius.base} text-xs font-medium text-slate-500 border border-slate-200`}>
                      <Wallet className="w-3.5 h-3.5 text-brand" />
                      {report.type}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative z-10 pt-5 border-t border-slate-100 mt-5 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
                <div>
                  <p className={tokens.statCardLabel + " mb-0.5"}>
                    {t("reportDetail.totalRequested")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-dark tracking-tight">
                      {report.requested_amount?.toLocaleString() ?? "—"}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{report.currency}</span>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={(e) => { e.stopPropagation(); navigate(`/reports/${report.id}`); }}
                >
                  {t("home.scanTicket")}
                  <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (hasActiveFilters) {
      return (
        <div className={`${tokens.emptyState} min-h-[180px]`}>
          <div className={tokens.emptyStateIcon}>
            <Search className="w-6 h-6 text-slate-300" />
          </div>
          <p className={tokens.emptyStateText}>
            {t("trips.noResultsFilter")}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-brand hover:underline uppercase tracking-wide"
          >
            {t("trips.filterClearAll")}
          </button>
        </div>
      );
    }

    return (
      <div className={`${tokens.emptyState} min-h-[240px]`}>
        <div className={tokens.emptyStateIcon}>
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className={tokens.emptyStateText}>{t("trips.noActiveTrips")}</p>
        <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-auto mt-4">
          <Plus className="w-4 h-4 mr-1.5" />
          {t("home.createFirst")}
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300 pb-16">

      {/* Header */}
      <PageHeader
        title={t("trips.title")}
        subtitle={t("home.summary")}
        icon={<FileText className="w-5 h-5 text-white" />}
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost-white"
            className="w-auto font-semibold text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("trips.newTripTitle")}
          </Button>
        }
      />

      {/* Filter bar */}
      {!isLoading && (reports?.length ?? 0) > 0 && (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
          totalCount={totalAll}
          filteredCount={totalFiltered}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("trips.newTripTitle")}
      >
        <div className={`mb-5 bg-brand/5 p-4 ${radius.base} flex items-start gap-3 border border-brand/10`}>
          <div className="mt-0.5 text-brand">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-sm text-brand-hover leading-relaxed">
            {t("trips.newTripInfoDesc")}
          </p>
        </div>
        <ReportForm
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Empty state — no reports at all */}
      {!isLoading && reports?.length === 0 && (
        <div className={`text-center py-20 bg-white ${radius.card} border border-dashed border-slate-200 px-6`}>
          <div className={`w-20 h-20 bg-brand/5 ${radius.full} flex items-center justify-center mx-auto mb-5`}>
            <FileText className="w-10 h-10 text-brand/30" />
          </div>
          <h3 className="text-2xl font-bold text-dark mb-2 tracking-tight">{t("trips.noTickets")}</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">{t("trips.primerViajeDesc")}</p>
          <Button onClick={() => setIsModalOpen(true)} className="w-auto px-8">
            {t("home.createFirst")}
          </Button>
        </div>
      )}

      {(isLoading || (reports && reports.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active trips */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <h2 className={tokens.listSectionTitle}>{t("home.activeTrip")}</h2>
              {!isLoading && filteredActive.length > 0 && (
                <span className={`${tokens.badgeSm} ${tokens.badgeBrand}`}>
                  {filteredActive.length}
                </span>
              )}
            </div>

            {renderActiveTrips()}
          </section>

          {/* History sidebar */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className={tokens.listSectionTitle}>{t("trips.summary")}</h2>
            </div>

            {isLoading ? (
              <SkeletonSidebar />
            ) : (
              <>
                {/* Stats */}
                <div className={`bg-white ${radius.card} border border-slate-200 shadow-sm p-4 space-y-2.5`}>
                  <div className={`flex items-center gap-3.5 p-3.5 ${radius.base} bg-success/5 border border-success/10`}>
                    <div className={`w-10 h-10 bg-white ${radius.base} shadow-sm flex items-center justify-center text-success border border-success/10 shrink-0`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={tokens.statCardLabel + " !text-success"}>
                        {t("trips.completedTrips")}
                      </p>
                      <p className="text-xl font-bold text-success leading-none mt-0.5">
                        {historyStats.totalCompleted}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3.5 p-3.5 ${radius.base} bg-brand/5 border border-brand/10`}>
                    <div className={`w-10 h-10 bg-white ${radius.base} shadow-sm flex items-center justify-center text-brand border border-brand/10 shrink-0`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={tokens.statCardLabel + " !text-brand"}>
                        {t("reportDetail.approved")}
                      </p>
                      <p className="text-lg font-bold text-dark leading-none mt-0.5">
                        {historyStats.totalSpent.toLocaleString()}{" "}
                        <span className="text-xs text-slate-400 font-medium">{filteredCompleted[0]?.currency || "EUR"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completed list */}
                <div className={`bg-white ${radius.card} border border-slate-200 shadow-sm overflow-hidden`}>
                  <div className={tokens.listSectionHeader}>
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <h3 className={tokens.listSectionTitle}>{t("trips.history")}</h3>
                  </div>

                  {filteredCompleted.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className={`w-10 h-10 bg-slate-50 ${radius.base} flex items-center justify-center mx-auto mb-3`}>
                        <Clock className="w-4 h-4 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {hasActiveFilters ? t("trips.noResultsFilter") : t("trips.noCompletedTrips")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredCompleted.slice(0, 4).map((report, idx) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => navigate(`/reports/${report.id}`)}
                          className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 group transition-colors ${idx < Math.min(filteredCompleted.length, 4) - 1 ? "border-b border-slate-50" : ""}`}
                        >
                          <div className={`w-8 h-8 bg-slate-100 ${radius.base} flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors`}>
                            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-dark text-sm truncate leading-tight">{report.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-semibold text-dark">
                              {(report.approved_amount || report.requested_amount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{report.currency}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand transition-colors ml-0.5" />
                          </div>
                        </button>
                      ))}
                      {filteredCompleted.length > 4 && (
                        <div className="px-4 py-3 bg-slate-50 text-center border-t border-slate-100">
                          <button
                            type="button"
                            className="text-[10px] font-semibold text-brand hover:underline uppercase tracking-wide"
                            onClick={() => navigate("/reports")}
                          >
                            {t("common.viewAll")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
