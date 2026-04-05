import { useMemo, useState } from "react";
import { Receipt, Search, X } from "lucide-react";
import { useReportsQuery, api, type ITicket } from "@ticket-registrator/shared";
import { DARK } from "../../reports/constants";
import { useQueries } from "@tanstack/react-query";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DateGroupHeader } from "../../../components/ui/DateGroupHeader";
import { TicketDetailModal } from "../components/TicketDetailModal";
import { useGroupedByDate } from "../../../hooks/useGroupedByDate";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ticketIcon } from "@ticket-registrator/shared/assets";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketWithReport = ITicket & { reportId: string; reportName: string };

// ─── Ticket card ──────────────────────────────────────────────────────────────

const TicketCard = ({
  ticket,
  onClick,
}: {
  ticket: TicketWithReport;
  onClick: () => void;
}) => (
  <PixelCard shadowOffset={3} onClick={onClick} className="w-full">
    <div className="flex items-center gap-3 px-3.5 py-3">

      {/* Ticket icon */}
      <img
        src={ticketIcon}
        alt=""
        className="w-10 h-10 shrink-0 object-contain opacity-90"
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="font-space-bold text-[13px] text-dark truncate leading-tight">
          {ticket.location_name || "Ticket"}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {ticket.expense_type && (
            <span
              className="font-space-bold text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0"
              style={{
                color: "#1E3A8A",
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              {ticket.expense_type}
            </span>
          )}
          <span
            className="font-space-semibold text-[9px] truncate"
            style={{ color: `${DARK}40` }}
          >
            {ticket.reportName}
          </span>
        </div>
      </div>

      {/* Amount + status */}
      <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
        <div className="flex items-baseline gap-1">
          <span
            className="font-space-bold text-dark tabular-nums leading-none"
            style={{ fontSize: 17 }}
          >
            {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
          </span>
          {ticket.currency && (
            <span
              className="font-space-bold leading-none"
              style={{ fontSize: 9, color: `${DARK}50` }}
            >
              {ticket.currency}
            </span>
          )}
        </div>
        <StatusBadge status={ticket.status} size="sm" />
      </div>
    </div>
  </PixelCard>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border-2 border-border-main/20 rounded-2xl p-3.5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-dark/10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 bg-dark/10 rounded" />
        <div className="h-2.5 w-1/3 bg-dark/10 rounded" />
      </div>
      <div className="space-y-1.5 shrink-0">
        <div className="h-4 w-16 bg-dark/10 rounded" />
        <div className="h-3 w-12 bg-dark/10 rounded ml-auto" />
      </div>
    </div>
  </div>
);

// ─── AllTicketsScreen ─────────────────────────────────────────────────────────

export const AllTicketsScreen = () => {
  const { t } = useTranslation();
  const { data: reports, isLoading: isLoadingReports } = useReportsQuery();

  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dateLocale = useDateLocale();

  // Fetch tickets for every report in parallel
  const ticketQueries = useQueries({
    queries: (reports || []).map((report) => ({
      queryKey: ["tickets", report.id],
      queryFn: () => api.tickets().getByReport(report.id),
      enabled: !!report.id,
    })),
  });

  const isLoadingTickets =
    (reports?.length ?? 0) > 0 && ticketQueries.some((q) => q.isLoading);
  const isLoading = isLoadingReports || isLoadingTickets;

  // Aggregate + filter all tickets across all reports
  const allTickets = useMemo<TicketWithReport[]>(() => {
    if (!reports) return [];
    const all: TicketWithReport[] = [];
    reports.forEach((report, idx) => {
      const reportTickets = ticketQueries[idx]?.data ?? [];
      reportTickets.forEach((ticket) => {
        if (search) {
          const q = search.toLowerCase();
          const matches =
            ticket.location_name?.toLowerCase().includes(q) ||
            ticket.expense_type?.toLowerCase().includes(q) ||
            ticket.items?.[0]?.expense_type?.toLowerCase().includes(q) ||
            String(ticket.amount).includes(q) ||
            report.name.toLowerCase().includes(q);
          if (!matches) return;
        }
        all.push({ ...ticket, reportId: report.id, reportName: report.name });
      });
    });
    return all;
  }, [reports, ticketQueries, search]);

  const groupedByDate = useGroupedByDate(allTickets);
  const totalTickets = groupedByDate.reduce((sum, g) => sum + g.items.length, 0);

  const handleTicketClick = (ticket: TicketWithReport) => {
    setSelectedTicket(ticket);
    setSelectedReportId(ticket.reportId);
    setIsDetailOpen(true);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    // Negative margins para que el header llegue a los bordes, igual que ReportsScreen
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-10 md:px-16 py-3"
        style={{ backgroundColor: "#FFFFFF", borderBottom: "4px solid rgba(26,26,26,0.2)" }}
      >
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("layout.allTickets")}
        </h1>

        {/* Badge en PixelCard — mismo tamaño que el botón "+" de ReportsScreen (inner 52px) */}
        {!isLoading && totalTickets > 0 && (
          <PixelCard shadowOffset={3} radius={14}>
            <div
              className="flex items-center justify-center px-4"
              style={{ height: 52 }}
            >
              <span className="font-space-bold text-dark/50" style={{ fontSize: 13 }}>
                {totalTickets}
              </span>
            </div>
          </PixelCard>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="space-y-5 animate-in fade-in duration-300 pb-16 px-10 md:px-16 pt-6">

      {/* Search bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-2 border-border-main rounded-2xl bg-white shadow-hard-sm">
        <Search className="w-4 h-4 text-dark/30 shrink-0" />
        <input
          type="text"
          placeholder={t("ticketsPage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={tokens.searchInput}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-dark/30 hover:text-dark transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          {[0, 1].map((g) => (
            <div key={g} className="space-y-2.5">
              {/* Fake date header */}
              <div className="flex items-center gap-3 px-0.5 mb-2.5">
                <div className="w-20 h-6 bg-dark/10 rounded-lg animate-pulse" />
                <div className="h-[1.5px] bg-dark/10 flex-1 rounded-full animate-pulse" />
                <div className="w-6 h-5 bg-dark/10 rounded animate-pulse" />
              </div>
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          ))}
        </div>
      ) : groupedByDate.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-7 h-7 text-white" />}
          title={search ? t("ticketsPage.noResults") : t("ticketsPage.noTickets")}
          description={search ? t("ticketsPage.noResultsDesc") : t("ticketsPage.noTicketsDesc")}
        />
      ) : (
        <div className="space-y-6">
          {groupedByDate.map(({ date, items: dayTickets }) => (
            <div key={date.toISOString()} className="space-y-2">
              <DateGroupHeader
                date={date}
                count={dayTickets.length}
                dateLocale={dateLocale}
                today={t("ticketsPage.today")}
                yesterday={t("ticketsPage.yesterday")}
              />
              {dayTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <TicketDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
        reportId={selectedReportId}
      />
      </div>
    </div>
  );
};
