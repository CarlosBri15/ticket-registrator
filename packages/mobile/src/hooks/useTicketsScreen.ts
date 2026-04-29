import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useReportsQuery, api, type ITicket } from '@ticket-registrator/shared';

export type FlatTicket = ITicket & { reportName: string };

type DateRange = { start: Date | null; end: Date | null };

const inRange = (dateStr: string | null, range: DateRange): boolean => {
  if (!range.start && !range.end) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr).getTime();
  const start = range.start ? new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate()).getTime() : -Infinity;
  const end   = range.end   ? new Date(range.end.getFullYear(),   range.end.getMonth(),   range.end.getDate(),   23, 59, 59).getTime() : Infinity;
  return d >= start && d <= end;
};

export const useTicketsScreen = () => {
  const { data: reports, isLoading: isLoadingReports } = useReportsQuery();

  const [selectedTicket, setSelectedTicket]   = useState<FlatTicket | null>(null);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [isDetailOpen, setIsDetailOpen]       = useState(false);

  const [search, setSearch]               = useState('');
  const [ticketDate, setTicketDate]       = useState<DateRange>({ start: null, end: null });
  const [uploadDate, setUploadDate]       = useState<DateRange>({ start: null, end: null });
  const [reportFilter, setReportFilter]   = useState<string | null>(null);

  const ticketQueries = useQueries({
    queries: (reports ?? []).map(report => ({
      queryKey: ['tickets', report.id],
      queryFn: () => api.tickets().getByReport(report.id),
      enabled: !!report.id,
    })),
  });

  const isLoading = isLoadingReports || ticketQueries.some(q => q.isLoading);

  const allTickets = useMemo<FlatTicket[]>(() => {
    if (!reports) return [];
    return ticketQueries
      .flatMap((q, idx) => {
        const report = reports[idx];
        if (!report || !q.data) return [];
        return q.data.map(ticket => ({ ...ticket, reportName: report.name }));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ticketQueries, reports]);

  const tickets = useMemo<FlatTicket[]>(() => {
    return allTickets.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        const matchText =
          t.location_name?.toLowerCase().includes(q) ||
          t.expense_type?.toLowerCase().includes(q) ||
          String(t.amount ?? '').includes(q) ||
          t.reportName.toLowerCase().includes(q);
        if (!matchText) return false;
      }
      if (!inRange(t.date, ticketDate)) return false;
      if (!inRange(t.createdAt, uploadDate)) return false;
      if (reportFilter && t.report_id !== reportFilter) return false;
      return true;
    });
  }, [allTickets, search, ticketDate, uploadDate, reportFilter]);

  const reportOptions = useMemo(
    () => (reports ?? []).map(r => ({ id: r.id, name: r.name })),
    [reports],
  );

  const hasFilters = !!(
    search ||
    ticketDate.start || ticketDate.end ||
    uploadDate.start || uploadDate.end ||
    reportFilter
  );

  const clearFilters = () => {
    setSearch('');
    setTicketDate({ start: null, end: null });
    setUploadDate({ start: null, end: null });
    setReportFilter(null);
  };

  const handleTicketPress = (ticket: FlatTicket) => {
    setSelectedTicket(ticket);
    setSelectedReportId(ticket.report_id);
    setIsDetailOpen(true);
  };

  return {
    tickets,
    isLoading,
    search,        setSearch,
    ticketDate,    setTicketDate,
    uploadDate,    setUploadDate,
    reportFilter,  setReportFilter,
    reportOptions,
    hasFilters,
    clearFilters,
    isDetailOpen,  setIsDetailOpen,
    selectedTicket, setSelectedTicket,
    selectedReportId,
    handleTicketPress,
  };
};
