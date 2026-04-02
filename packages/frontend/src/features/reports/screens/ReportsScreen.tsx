import { useState, useMemo } from "react";
import { useReportsQuery } from "@ticket-registrator/shared";
import { reportIcon } from "@ticket-registrator/shared/assets";

import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
import { Modal } from "../../../components/ui/Modal";
import { ReportForm } from "../components/ReportForm";
import {
  Plus, Search, X, Calendar, Send,
  Clock, ChevronDown, ChevronUp, FileText,
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

const STATUS_OPTIONS = ["ALL", "CREATED", "DRAFT", "PENDING", "SUBMITTED", "APPROVED", "DECLINED"] as const;
const ACTIVE_STATUSES = new Set(["CREATED", "DRAFT", "PENDING", "SUBMITTED"]);
const PENDING_STATUSES = new Set(["CREATED", "DRAFT"]);
const COMPLETED_STATUSES = new Set(["APPROVED", "PAID", "REJECTED", "DECLINED"]);
const HISTORY_LIMIT = 5;
const DARK = "#1A1A1A";
const SHADOW = "rgba(26, 26, 26, 0.15)";

const isCurrentReport = (r: { start_date: string; end_date: string }): boolean => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(r.start_date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(r.end_date);
  end.setHours(23, 59, 59, 999);
  return today >= start && today <= end;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border-2 border-border-main/20 rounded-lg p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 bg-dark/10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-dark/10 rounded" />
        <div className="h-3 w-1/2 bg-dark/10 rounded" />
      </div>
      <div className="space-y-1.5 shrink-0">
        <div className="h-5 w-16 bg-dark/10 rounded" />
        <div className="h-4 w-14 bg-dark/10 rounded ml-auto" />
      </div>
    </div>
  </div>
);

// ─── Horizontal Filter Bar (mobile-style: search row + pills row) ─────────────

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatus: (v: string) => void;
  dateFrom: string;
  onDateFrom: (v: string) => void;
  dateTo: string;
  onDateTo: (v: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

const FilterBar = ({
  search, onSearch,
  statusFilter, onStatus,
  dateFrom, onDateFrom,
  dateTo, onDateTo,
  hasFilters, onClear,
}: FilterBarProps) => {
  const { t } = useTranslation();
  const [statusOpen, setStatusOpen] = useState(false);

  const statusLabel = statusFilter === "ALL"
    ? t("trips.filterAll")
    : t(`status.${statusFilter}`);
  const statusActive = statusFilter !== "ALL";

  return (
    <div className="flex items-center gap-2">

      {/* Search — flex-1 so it takes remaining space */}
      <PixelCard shadowOffset={3} radius={6} className="flex-1">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}60` }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("trips.filterSearch")}
            className="flex-1 min-w-0 bg-transparent text-sm font-space-semibold text-dark placeholder:text-dark/40 placeholder:font-space focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => onSearch("")} className="text-dark/30 hover:text-dark">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </PixelCard>

      {/* Date from */}
      <PixelCard bg={dateFrom ? "#4D4DFF" : "#FFFFFF"} shadowOffset={3} radius={6} active={!!dateFrom}>
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: dateFrom ? "#fff" : `${DARK}60` }} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFrom(e.target.value)}
            className="bg-transparent font-space-bold focus:outline-none cursor-pointer w-[110px]"
            style={{ fontSize: 11, color: dateFrom ? "#fff" : DARK, colorScheme: "light" }}
          />
        </div>
      </PixelCard>

      {/* Date to */}
      <PixelCard bg={dateTo ? "#4D4DFF" : "#FFFFFF"} shadowOffset={3} radius={6} active={!!dateTo}>
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: dateTo ? "#fff" : `${DARK}60` }} />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateTo(e.target.value)}
            className="bg-transparent font-space-bold focus:outline-none cursor-pointer w-[110px]"
            style={{ fontSize: 11, color: dateTo ? "#fff" : DARK, colorScheme: "light" }}
          />
        </div>
      </PixelCard>

      {/* Status pill + dropdown */}
      <div className="relative">
        <PixelCard
          bg={statusActive ? "#4D4DFF" : "#FFFFFF"}
          shadowOffset={3}
          radius={6}
          active={statusActive || statusOpen}
          onClick={() => setStatusOpen(o => !o)}
        >
          <div className="flex items-center justify-between gap-1.5 px-3 py-2.5 w-[148px]">
            <span className="font-space-bold truncate" style={{ fontSize: 11, color: statusActive ? "#fff" : DARK }}>
              {statusLabel}
            </span>
            <ChevronDown className="w-3 h-3 shrink-0" style={{ color: statusActive ? "#fff" : DARK }} />
          </div>
        </PixelCard>

        {statusOpen && (
          <>
            <button type="button" className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} aria-label="Close status filter" />
            <div
              className="absolute right-0 top-full mt-1 z-20 py-1 min-w-[160px]"
              style={{ backgroundColor: "#fff", border: `2px solid ${SHADOW}`, borderRadius: 8, boxShadow: `4px 4px 0px ${SHADOW}` }}
            >
              {STATUS_OPTIONS.map((s, idx) => {
                const active = statusFilter === s;
                const label = s === "ALL" ? t("trips.filterAll") : t(`status.${s}`);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onStatus(s); setStatusOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      color: active ? "#4D4DFF" : DARK,
                      borderBottom: idx < STATUS_OPTIONS.length - 1 ? `1px solid rgba(26,26,26,0.08)` : "none",
                    }}
                  >
                    {label}
                    {active && (
                      <span style={{ width: 18, height: 18, borderRadius: 6, backgroundColor: "#4D4DFF", border: `2px solid ${SHADOW}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Clear — only visible when filters active */}
      {hasFilters && (
        <button type="button" onClick={onClear} className="text-danger shrink-0">
          <X className="w-5 h-5" />
        </button>
      )}

    </div>
  );
};

// ─── Hero Report Card ─────────────────────────────────────────────────────────

interface ReportCardProps {
  report: any;
  onClick: () => void;
  dateLocale: Locale;
}

const HeroReportCard = ({ report, onClick, dateLocale }: ReportCardProps) => (
  <PixelCard shadowOffset={6} onClick={onClick} className="w-full">
    <div className="flex items-start justify-between gap-3 pt-5 px-5 mb-5">
      <p
        className="flex-1 font-space-bold text-dark leading-tight"
        style={{ fontSize: 26, letterSpacing: "-0.4px" }}
      >
        {report.name}
      </p>
      <span
        className="shrink-0"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          backgroundColor: "#4D4DFF",
          border: `2px solid ${SHADOW}`,
          borderRadius: 12,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 5,
          paddingBottom: 5,
          boxShadow: `3px 3px 0px ${SHADOW}`,
        }}
      >
        <span style={{ width: 6, height: 6, backgroundColor: "#fff", borderRadius: "50%" }} />
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color: "#fff",
            letterSpacing: "0.2px",
          }}
        >
          En curso
        </span>
      </span>
    </div>

    <div
      className="flex items-center gap-4 px-5 pb-5 pt-4"
      style={{ borderTop: "2px solid rgba(26,26,26,0.07)" }}
    >
      <img
        src={reportIcon}
        alt=""
        className="w-16 h-16 object-contain shrink-0 select-none"
        style={{ opacity: 0.85 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" style={{ color: `${DARK}50` }} />
          <span className="font-space-semibold text-dark" style={{ fontSize: 13 }}>
            {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })}
            {" – "}
            {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </span>
        </div>
        {report.type && (
          <p className="font-space text-dark/30 mt-1" style={{ fontSize: 12 }}>{report.type}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className="font-space-bold text-dark" style={{ fontSize: 30, letterSpacing: "-0.8px", lineHeight: 1 }}>
          {(report.requested_amount ?? 0).toLocaleString()}
        </span>
        {" "}
        <span className="font-space-bold" style={{ fontSize: 15, color: `${DARK}55` }}>
          {report.currency}
        </span>
      </div>
    </div>
  </PixelCard>
);

// ─── Compact Report Row ───────────────────────────────────────────────────────

const ReportRow = ({ report, onClick, dateLocale }: ReportCardProps) => (
  <PixelCard shadowOffset={3} onClick={onClick} className="w-full">
    <div className="flex items-center gap-4 px-4 py-3.5">
      <img src={reportIcon} alt="" className="w-14 h-14 object-contain shrink-0 select-none" />
      <div className="flex-1 min-w-0">
        <p className="font-space-bold text-dark truncate" style={{ fontSize: 15 }}>
          {report.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className="w-3 h-3" style={{ color: `${DARK}50` }} />
          <span className="font-space-semibold" style={{ fontSize: 12, color: `${DARK}60` }}>
            {format(new Date(report.start_date ?? report.end_date), "dd MMM", { locale: dateLocale })}
            {report.end_date && report.end_date !== report.start_date &&
              ` – ${format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}`}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="font-space-bold text-dark tabular-nums" style={{ fontSize: 16 }}>
          {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
          <span className="font-space-bold" style={{ fontSize: 11, color: `${DARK}50` }}>
            {" "}{report.currency}
          </span>
        </span>
        <StatusBadge status={report.status} size="md" />
      </div>
    </div>
  </PixelCard>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-3.5">
    <span style={{ color: `${DARK}50` }}>{icon}</span>
    <p className="flex-1 font-space-bold text-dark" style={{ fontSize: 12, letterSpacing: "0.3px" }}>
      {label}
    </p>
    {count != null && (
      <span
        style={{
          backgroundColor: "#fff",
          border: `2px solid ${SHADOW}`,
          borderRadius: 10,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 3,
          paddingBottom: 3,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          color: DARK,
        }}
      >
        {count}
      </span>
    )}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({
  title, description, onAction, actionLabel, filtered, onClear,
}: {
  title: string; description: string;
  onAction?: () => void; actionLabel?: string;
  filtered?: boolean; onClear?: () => void;
}) => (
  <PixelCard shadowOffset={3} className="w-full">
    <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
      <div
        style={{
          width: 52, height: 52,
          backgroundColor: "#4D4DFF",
          border: `2px solid ${SHADOW}`,
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `3px 3px 0px ${SHADOW}`,
        }}
      >
        <FileText className="w-5 h-5 text-white" />
      </div>
      <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>{title}</p>
      <p className="font-space text-dark/40 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>
        {description}
      </p>
      {filtered && onClear && (
        <button type="button" onClick={onClear} className="font-space-bold text-brand underline underline-offset-2" style={{ fontSize: 12 }}>
          Limpiar filtros
        </button>
      )}
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="neo-press inline-flex items-center gap-1.5 mt-1"
          style={{
            backgroundColor: "#4D4DFF", border: `2px solid ${SHADOW}`, borderRadius: 99,
            paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
            color: "#fff", boxShadow: `3px 3px 0px ${SHADOW}`,
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  </PixelCard>
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
  const [showAllHistory, setShowAllHistory] = useState(false);

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;
  const hasActiveFilters = !!(search.trim() || statusFilter !== "ALL" || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setDateFrom(""); setDateTo("");
  };

  const currentReport = useMemo(
    () => reports?.find(r => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r)) ?? null,
    [reports],
  );

  const allPending = useMemo(
    () => reports?.filter(r => PENDING_STATUSES.has(r.status.toUpperCase()) && r.id !== currentReport?.id) ?? [],
    [reports, currentReport],
  );
  const allCompleted = useMemo(
    () => reports?.filter(r => COMPLETED_STATUSES.has(r.status.toUpperCase())) ?? [],
    [reports],
  );

  const filteredPending = useMemo(() => {
    let list = allPending;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(list, dateFrom || null, dateTo || null);
    return list;
  }, [allPending, search, statusFilter, dateFrom, dateTo]);

  const filteredCompleted = useMemo(() => {
    let list = allCompleted;
    list = filterBySearch(list, search);
    if (statusFilter !== "ALL") list = filterByStatus(list, statusFilter);
    list = filterByDateRange(list, dateFrom || null, dateTo || null);
    return list;
  }, [allCompleted, search, statusFilter, dateFrom, dateTo]);

  const visibleCompleted = showAllHistory ? filteredCompleted : filteredCompleted.slice(0, HISTORY_LIMIT);
  const hiddenCount = filteredCompleted.length - HISTORY_LIMIT;

  return (
    // Negative margins escape AppLayout's px/py padding so header reaches edges
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 md:px-10 py-3"
        style={{ backgroundColor: "#FFFFFF", borderBottom: `4px solid ${SHADOW}` }}
      >
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("trips.title")}
        </h1>
        <PixelCard bg="#4D4DFF" shadowOffset={3} radius={8} onClick={() => setIsModalOpen(true)}>
          <div className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
            <Plus className="w-5 h-5 text-white" />
          </div>
        </PixelCard>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("trips.newTripTitle")}>
        <ReportForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* ── Two-column: active reports (left) + historial (right) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_420px]">

        {/* ── Left: Filters + Hero + Por enviar ────────────────────────────── */}
        <main className="px-6 md:px-10 pt-4 pb-7 lg:pb-9 space-y-6">

          {/* Filters — above the active report */}
          {!isLoading && (reports?.length ?? 0) > 0 && (
            <FilterBar
              search={search} onSearch={setSearch}
              statusFilter={statusFilter} onStatus={setStatusFilter}
              dateFrom={dateFrom} onDateFrom={setDateFrom}
              dateTo={dateTo} onDateTo={setDateTo}
              hasFilters={hasActiveFilters} onClear={clearFilters}
            />
          )}

          {!isLoading && !reports?.length && (
            <EmptyState
              title={t("trips.noTickets")}
              description={t("trips.primerViajeDesc")}
              onAction={() => setIsModalOpen(true)}
              actionLabel={t("home.createFirst")}
            />
          )}

          {isLoading && (
            <div className="space-y-2.5">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {/* Reporte activo */}
          {!isLoading && currentReport && (
            <section>
              <SectionHeader icon={<FileText className="w-3 h-3" />} label={t("home.activeTrip")} />
              <HeroReportCard
                report={currentReport}
                onClick={() => navigate(`/reports/${currentReport.id}`)}
                dateLocale={dateLocale}
              />
            </section>
          )}

          {/* Por enviar */}
          {!isLoading && (filteredPending.length > 0 || (!currentReport && (reports?.length ?? 0) > 0)) && (
            <section>
              <SectionHeader
                icon={<Send className="w-3 h-3" />}
                label="Por enviar"
                count={filteredPending.length || undefined}
              />
              {filteredPending.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredPending.map(r => (
                    <ReportRow key={r.id} report={r} onClick={() => navigate(`/reports/${r.id}`)} dateLocale={dateLocale} />
                  ))}
                </div>
              ) : hasActiveFilters ? (
                <PixelCard shadowOffset={3} className="w-full">
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
                <EmptyState
                  title={t("trips.noActiveTrips")}
                  description={t("trips.primerViajeDesc")}
                  onAction={() => setIsModalOpen(true)}
                  actionLabel={t("home.createFirst")}
                />
              )}
            </section>
          )}
        </main>

        {/* ── Separator ────────────────────────────────────────────────────────── */}
        <div
          className="hidden lg:block self-stretch"
          style={{ width: 2, backgroundColor: `rgba(26,26,26,0.12)` }}
        />

        {/* ── Right: Historial ──────────────────────────────────────────────── */}
        <aside className="px-6 md:px-8 py-7 lg:py-9">
          {!isLoading && filteredCompleted.length > 0 ? (
            <section>
              <SectionHeader
                icon={<Clock className="w-3 h-3" />}
                label={t("trips.history")}
                count={filteredCompleted.length}
              />
              <div className="space-y-2.5">
                {visibleCompleted.map(r => (
                  <ReportRow key={r.id} report={r} onClick={() => navigate(`/reports/${r.id}`)} dateLocale={dateLocale} />
                ))}
              </div>

              {hiddenCount > 0 && !showAllHistory && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory(true)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-space-bold text-dark mt-1"
                  style={{ borderTop: `2px solid rgba(26,26,26,0.07)`, fontSize: 12, letterSpacing: "0.3px" }}
                >
                  Ver todos{" "}
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
                  style={{ borderTop: `2px solid rgba(26,26,26,0.07)`, fontSize: 12 }}
                >
                  Ver menos <ChevronUp className="w-3.5 h-3.5" />
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
                Aquí aparecerán los reportes cerrados
              </p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
