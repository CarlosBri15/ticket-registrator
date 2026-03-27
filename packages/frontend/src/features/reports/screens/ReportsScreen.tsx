import { useState, useMemo } from "react";
import { useReportsQuery } from "@ticket-registrator/shared";
import { reportIcon } from "@ticket-registrator/shared/assets";

import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Modal } from "../../../components/ui/Modal";
import { ReportForm } from "../components/ReportForm";
import {
  Plus, Calendar, FileText, Wallet,
  ChevronRight, BarChart3, Search, X,
  CheckCircle, Clock, MapPin, SlidersHorizontal,
} from "lucide-react";

import { format, type Locale } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  filterBySearch,
  filterByStatus,
  filterByDateRange,
} from "../../../utils/reportAnalytics";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["ALL", "CREATED", "SUBMITTED", "APPROVED", "DECLINED"];

const CARD_STYLE = {
  border: "1px solid #edf0f5",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="bg-white rounded-2xl p-4 animate-pulse" style={CARD_STYLE}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
        <div className="h-3 w-1/3 bg-slate-100 rounded-lg" />
      </div>
      <div className="text-right space-y-1.5 shrink-0">
        <div className="h-6 w-20 bg-slate-100 rounded-lg" />
        <div className="h-3 w-8 bg-slate-100 rounded-full ml-auto" />
      </div>
    </div>
  </div>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────

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
    <div className="bg-white rounded-2xl p-4 space-y-3" style={CARD_STYLE}>
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("trips.filterSearch")}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/8 transition-all"
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
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            {t("trips.filterClearAll")}
          </button>
        )}
      </div>

      {/* Chips + dates row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s
              ? "bg-brand text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
          >
            {s === "ALL" ? t("trips.filterAll") : t(`status.${s}`)}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-transparent focus:outline-none cursor-pointer w-28"
            />
          </div>
          <span className="text-slate-300 text-xs">—</span>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-transparent focus:outline-none cursor-pointer w-28"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <p className="text-xs text-slate-400">
          {t("trips.filterResultsCount", { count: filteredCount })}{" "}
          <span className="text-slate-300">/ {totalCount}</span>
        </p>
      )}
    </div>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────

interface ReportCardProps {
  report: any;
  onClick: () => void;
  dateLocale: Locale;
}

const ReportCard = ({ report, onClick, dateLocale }: ReportCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left bg-white rounded-2xl p-4 hover:bg-slate-50/70 transition-colors group"
    style={CARD_STYLE}
  >
    <div className="flex items-center gap-3">
      <img src={reportIcon} alt="" className="w-10 h-10 object-contain shrink-0 select-none" />
      <div className="flex-1 min-w-0">
        {/* Status + ID */}
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={report.status} size="sm" />
          <span className="text-[10px] font-mono text-slate-300">
            #{(report.id || "").substring(0, 8)}
          </span>
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-slate-800 leading-snug mb-1.5 group-hover:text-brand transition-colors truncate">
          {report.name}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })}
            {" — "}
            {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </span>
          {report.type && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Wallet className="w-3 h-3" />
              {report.type}
            </span>
          )}
        </div>
      </div>

      {/* Amount + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {report.requested_amount > 0 && (
          <div className="text-right">
            <p className="text-base font-bold text-slate-900 tabular-nums leading-none">
              {report.requested_amount.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
              {report.currency}
            </p>
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
      </div>
    </div>
  </button>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reports, isLoading } = useReportsQuery();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;
  const hasActiveFilters = !!(search.trim() || statusFilter !== "ALL" || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setDateFrom(""); setDateTo("");
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

  const totalSpent = filteredCompleted.reduce((acc, r) => acc + (r.approved_amount || 0), 0);
  const totalFiltered = filteredActive.length + filteredCompleted.length;
  const totalAll = reports?.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300 pb-16">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t("trips.title")}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{t("home.summary")}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          {t("trips.newTripTitle")}
        </Button>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      {!isLoading && (reports?.length ?? 0) > 0 && (
        <FilterBar
          search={search} onSearchChange={setSearch}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          dateFrom={dateFrom} onDateFromChange={setDateFrom}
          dateTo={dateTo} onDateToChange={setDateTo}
          hasActiveFilters={hasActiveFilters} onClear={clearFilters}
          totalCount={totalAll} filteredCount={totalFiltered}
        />
      )}

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("trips.newTripTitle")}
      >
        <div className="mb-5 bg-brand/5 p-4 rounded-xl flex items-start gap-3 border border-brand/10">
          <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
          <p className="text-sm text-brand-hover leading-relaxed">
            {t("trips.newTripInfoDesc")}
          </p>
        </div>
        <ReportForm
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* ── Empty state — zero reports ──────────────────────────────────────── */}
      {!isLoading && reports?.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 px-6 py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">{t("trips.noTickets")}</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
            {t("trips.primerViajeDesc")}
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="w-auto px-8">
            {t("home.createFirst")}
          </Button>
        </div>
      )}

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      {(isLoading || (reports && reports.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Active reports ────────────────────────────────────────────── */}
          <section className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <p className="text-sm font-medium text-slate-500">{t("home.activeTrip")}</p>
              {!isLoading && filteredActive.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand/8 text-brand">
                  {filteredActive.length}
                </span>
              )}
            </div>

            {(() => {
              if (isLoading) {
                return (
                  <div className="space-y-3">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                );
              }
              if (filteredActive.length > 0) {
                return (
                  <div className="space-y-2.5">
                    {filteredActive.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onClick={() => navigate(`/reports/${report.id}`)}
                        dateLocale={dateLocale}
                      />
                    ))}
                  </div>
                );
              }
              if (hasActiveFilters) {
                return (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <Search className="w-6 h-6 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">{t("trips.noResultsFilter")}</p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                    >
                      {t("trips.filterClearAll")}
                    </button>
                  </div>
                );
              }
              return (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <FileText className="w-6 h-6 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-4">{t("trips.noActiveTrips")}</p>
                  <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    {t("home.createFirst")}
                  </Button>
                </div>
              );
            })()}
          </section>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <section className="space-y-4">

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="bg-white rounded-2xl p-5 h-28" style={CARD_STYLE} />
                <div className="bg-white rounded-2xl p-5 h-28" style={CARD_STYLE} />
              </div>
            ) : (
              <>
                {/* Stat: completed */}
                <div className="bg-white rounded-2xl p-5" style={CARD_STYLE}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{t("trips.completedTrips")}</p>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold tracking-tight text-slate-900">
                    {filteredCompleted.length}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{t("trips.summary")}</p>
                </div>

                {/* Stat: total approved */}
                <div className="bg-white rounded-2xl p-5" style={CARD_STYLE}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{t("reportDetail.approved")}</p>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
                    >
                      <Wallet className="w-4 h-4 text-brand" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                      {totalSpent.toLocaleString()}
                    </p>
                    <span className="text-sm text-slate-400">
                      {filteredCompleted[0]?.currency || "EUR"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{t("reportDetail.totalRequested")}</p>
                </div>

                {/* History list */}
                <div className="bg-white rounded-2xl overflow-hidden" style={CARD_STYLE}>
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
                    <BarChart3 className="w-4 h-4 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">{t("trips.history")}</p>
                  </div>

                  {filteredCompleted.length === 0 ? (
                    <div className="p-8 text-center">
                      <Clock className="w-5 h-5 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">
                        {hasActiveFilters ? t("trips.noResultsFilter") : t("trips.noCompletedTrips")}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredCompleted.slice(0, 5).map((report, idx) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => navigate(`/reports/${report.id}`)}
                          className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group"
                          style={{ borderBottom: idx < Math.min(filteredCompleted.length, 5) - 1 ? "1px solid #f8fafc" : "none" }}
                        >
                          <StatusBadge status={report.status} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-brand transition-colors">
                              {report.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-slate-700 tabular-nums">
                              {(report.approved_amount || report.requested_amount || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400">{report.currency}</p>
                          </div>
                        </button>
                      ))}
                    </div>
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
