import { useMemo, useState } from "react";
import { Receipt, ChevronRight } from "lucide-react";
import { useReportsQuery, api, useGroupedByDate, type ITicket } from "@ticket-registrator/shared";
import { useQueries } from "@tanstack/react-query";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DateGroupHeader } from "../../../components/ui/DateGroupHeader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SearchInput } from "../../../components/ui/SearchInput";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TicketDetailModal } from "../components/TicketDetailModal";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";
import { TICKET_GRID } from "../../../constants/gridLayouts";

type TicketWithReport = ITicket & { reportId: string; reportName: string };

// ─── Ticket row ───────────────────────────────────────────────────────────────

const TicketRow = ({
  ticket,
  onClick,
}: {
  ticket: TicketWithReport;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="list-row group w-full text-left gap-4"
    style={{ gridTemplateColumns: TICKET_GRID }}
  >
    <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
      <Receipt className="w-3.5 h-3.5" aria-hidden={true} />
    </div>

    <div className="min-w-0">
      <p className="row-name truncate">{ticket.location_name || "Ticket"}</p>
      <div className="flex items-center gap-2 mt-0.5 min-w-0">
        {ticket.items?.[0]?.categoryName && (
          <span className="row-meta truncate">{ticket.items[0].categoryName}</span>
        )}
        {ticket.items?.[0]?.categoryName && ticket.reportName && (
          <span className="text-dark/20 text-[11px]">·</span>
        )}
        <span className="row-meta truncate">{ticket.reportName}</span>
      </div>
    </div>

    <div className="flex items-center justify-end">
      <StatusBadge status={ticket.status} />
    </div>

    <p className="row-num text-right">
      {ticket.amount == null ? "---" : ticket.amount.toLocaleString()}
      {ticket.amount != null && ticket.currency && (
        <span className="cur">{ticket.currency}</span>
      )}
    </p>

    <ChevronRight className="row-chev w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-100" aria-hidden={true} />
  </button>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div
    className="list-row gap-4 animate-pulse cursor-default pointer-events-none"
    style={{ gridTemplateColumns: TICKET_GRID }}
  >
    <div className="w-8 h-8 rounded-md bg-dark/5 border border-[var(--color-border-main)]" />
    <div className="space-y-2 min-w-0">
      <div className="h-3.5 w-1/2 bg-dark/8 rounded" />
      <div className="h-2.5 w-1/3 bg-dark/5 rounded" />
    </div>
    <div className="h-4 w-16 bg-dark/8 rounded justify-self-end" />
    <div className="h-3.5 w-12 bg-dark/8 rounded justify-self-end" />
    <div />
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

  const allTickets = useMemo<TicketWithReport[]>(() => {
    if (!reports) return [];
    const all: TicketWithReport[] = [];
    reports.forEach((report, idx) => {
      const reportTickets = ticketQueries[idx]?.data ?? [];
      reportTickets.forEach((ticket: ITicket) => {
        if (search) {
          const q = search.toLowerCase();
          const matches =
            ticket.location_name?.toLowerCase().includes(q) ||
            ticket.items?.[0]?.categoryName?.toLowerCase().includes(q) ||
            ticket.items?.[0]?.name?.toLowerCase().includes(q) ||
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

  const hasReports = (reports?.length ?? 0) > 0;
  const hasAnyTickets = allTickets.length > 0;

  const handleTicketClick = (ticket: TicketWithReport) => {
    setSelectedTicket(ticket);
    setSelectedReportId(ticket.reportId);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("ticketsPage.title")}
        subtitle={t("ticketsPage.desc")}
        stats={hasAnyTickets ? [{ label: t("ticketsPage.title"), value: totalTickets }] : undefined}
      />

      <div className="flex flex-col gap-4">
        {hasReports && (
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("ticketsPage.searchPlaceholder")}
          />
        )}

        {(() => {
          if (isLoading) {
            return (
              <div className="flex flex-col gap-6">
                <p className="sr-only">{t("ticketsPage.loading")}</p>
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                </div>
                <div>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              </div>
            );
          }

          if (!hasAnyTickets) {
            return (
              <EmptyState
                icon={<Receipt className="w-4 h-4" aria-hidden={true} />}
                title={search ? t("ticketsPage.noResults") : t("ticketsPage.noTickets")}
                description={search ? t("ticketsPage.noResultsDesc") : t("ticketsPage.noTicketsDesc")}
              />
            );
          }

          return (
            <div className="flex flex-col gap-6">
              {groupedByDate.map(({ date, items: dayTickets }) => (
                <div key={date.toISOString()}>
                  <DateGroupHeader
                    date={date}
                    count={dayTickets.length}
                    dateLocale={dateLocale}
                    today={t("ticketsPage.today")}
                    yesterday={t("ticketsPage.yesterday")}
                  />
                  {dayTickets.map((ticket: TicketWithReport) => {
                    const onRowClick = () => handleTicketClick(ticket);
                    return (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        onClick={onRowClick}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <TicketDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
        reportId={selectedReportId}
      />
    </div>
  );
};
