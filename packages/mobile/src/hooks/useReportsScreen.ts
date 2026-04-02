import { useMemo, useState, useCallback, useEffect } from 'react';
import { useReportsPaginatedQuery, ReportPaginationParams } from '@ticket-registrator/shared';
import { useTranslation } from 'react-i18next';
import { isCurrentReport } from '../utils/date';

const ACTIVE_STATUSES    = new Set(['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED']);
const PENDING_STATUSES   = new Set(['CREATED', 'DRAFT']);
const COMPLETED_STATUSES = new Set(['APPROVED', 'PAID', 'REJECTED', 'DECLINED']);

export const useReportsScreen = () => {
  const { i18n } = useTranslation();

  // UI state — responde inmediatamente
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate,    setStartDate]    = useState<Date | null>(null);
  const [endDate,      setEndDate]      = useState<Date | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);

  // Debounce del search para no disparar una petición por cada tecla
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams: ReportPaginationParams = {
    name:      debouncedSearch || undefined,
    status:    statusFilter === 'ALL' ? undefined : statusFilter,
    startDate: startDate?.toISOString(),
    endDate:   endDate?.toISOString(),
    limit:     100,
  };

  const { data: paginatedData, refetch, isLoading } = useReportsPaginatedQuery(queryParams);
  const reports = paginatedData?.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('ALL');
    setStartDate(null);
    setEndDate(null);
  }, []);

  // Partición local — el servidor ya filtró, aquí solo separamos por rol visual
  const currentReport = useMemo(
    () => reports.find(r => ACTIVE_STATUSES.has(r.status.toUpperCase()) && isCurrentReport(r)) ?? null,
    [reports],
  );

  const filteredPending = useMemo(
    () => reports.filter(r => PENDING_STATUSES.has(r.status.toUpperCase()) && r.id !== currentReport?.id),
    [reports, currentReport],
  );

  const filteredCompleted = useMemo(
    () => reports.filter(r => COMPLETED_STATUSES.has(r.status.toUpperCase())),
    [reports],
  );

  const summaryStats = useMemo(() => ({
    count:    filteredCompleted.length,
    total:    filteredCompleted.reduce((acc, r) => acc + (r.approved_amount ?? 0), 0),
    currency: filteredCompleted[0]?.currency ?? 'EUR',
  }), [filteredCompleted]);

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'ALL' || startDate !== null || endDate !== null;

  return {
    reports,
    currentReport,
    filteredPending,
    filteredCompleted,
    summaryStats,
    isLoading,
    refreshing,
    search,       setSearch,
    statusFilter, setStatusFilter,
    startDate,    setStartDate,
    endDate,      setEndDate,
    hasActiveFilters,
    clearFilters,
    onRefresh,
    language: i18n.language,
  };
};
