import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import {
  useReportsQuery,
  api,
  useGroupedByDate,
  type ITicket,
} from "@ticket-registrator/shared";
import { useQueries } from "@tanstack/react-query";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { DateGroupHeader } from "../../../components/ui/DateGroupHeader";
import {
  FilterBar,
  FilterClearAll,
  FilterSearch,
} from "../../../components/ui/FilterBar";
import {
  TicketsTableHeader,
  TicketRow,
  TicketRowSkeleton,
  type TicketsTableRow,
} from "../components/TicketsTable";
import { TicketDetailModal } from "../components/TicketDetailModal";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";

type TicketWithReport = TicketsTableRow & { reportId: string };

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
  const hasAnyTickets = totalTickets > 0;
  const hasSearch = search.length > 0;

  const handleTicketClick = (ticket: TicketsTableRow) => {
    setSelectedTicket(ticket);
    setSelectedReportId((ticket as TicketWithReport).reportId);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("ticketsPage.title")}
        stats={
          hasAnyTickets
            ? [{
                label: t("ticketsPage.title"),
                value: totalTickets,
                icon: <Receipt className="w-4 h-4" aria-hidden={true} />,
              }]
            : undefined
        }
      />

      <div className="flex flex-col gap-4">
        {hasReports && (
          <FilterBar
            trailing={
              hasSearch ? (
                <FilterClearAll onClick={() => setSearch("")}>
                  {t("trips.filterClearAll")}
                </FilterClearAll>
              ) : null
            }
          >
            <FilterSearch
              value={search}
              onChange={setSearch}
              placeholder={t("ticketsPage.searchPlaceholder")}
            />
          </FilterBar>
        )}

        {(() => {
          if (isLoading) {
            return (
              <div className="flex flex-col gap-3">
                <p className="sr-only">{t("ticketsPage.loading")}</p>
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                </div>
                <div className="w-full rounded-[14px] border border-[var(--color-border-main)] bg-surface-card-soft overflow-hidden">
                  <TicketsTableHeader />
                  <TicketRowSkeleton />
                  <TicketRowSkeleton />
                  <TicketRowSkeleton />
                </div>
              </div>
            );
          }

          if (!hasAnyTickets) {
            return (
              <EmptyState
                icon={<Receipt className="w-4 h-4" aria-hidden={true} />}
                title={hasSearch ? t("ticketsPage.noResults") : t("ticketsPage.noTickets")}
                description={hasSearch ? t("ticketsPage.noResultsDesc") : t("ticketsPage.noTicketsDesc")}
              />
            );
          }

          return (
            <div className="w-full rounded-[14px] border border-[var(--color-border-main)] bg-surface-card-soft overflow-hidden">
              <TicketsTableHeader />
              {groupedByDate.map(({ date, items: dayTickets }) => (
                <div key={date.toISOString()}>
                  <DateGroupHeader
                    date={date}
                    count={dayTickets.length}
                    dateLocale={dateLocale}
                    today={t("ticketsPage.today")}
                    yesterday={t("ticketsPage.yesterday")}
                  />
                  {dayTickets.map((ticket: TicketWithReport) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onClick={handleTicketClick}
                    />
                  ))}
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
