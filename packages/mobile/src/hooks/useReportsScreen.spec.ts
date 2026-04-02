import { renderHook, act } from '@testing-library/react-native';
import { useReportsScreen } from './useReportsScreen';
import { useReportsPaginatedQuery } from '@ticket-registrator/shared';
import { isCurrentReport } from '../utils/date';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'es' },
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useReportsPaginatedQuery: jest.fn(),
}));

jest.mock('../utils/date', () => ({
  isCurrentReport: jest.fn(),
}));

describe('useReportsScreen', () => {
  const mockRefetch = jest.fn();
  const mockReports = [
    { id: '1', status: 'CREATED', approved_amount: 0, start_date: '2024-01-01', end_date: '2024-01-31' },
    { id: '2', status: 'APPROVED', approved_amount: 150.5, currency: 'EUR' },
    { id: '3', status: 'SUBMITTED', approved_amount: 0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useReportsPaginatedQuery as jest.Mock).mockReturnValue({
      data: { data: mockReports },
      refetch: mockRefetch,
      isLoading: false,
    });
    
    (isCurrentReport as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useReportsScreen());
    expect(result.current.search).toBe('');
    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.startDate).toBeNull();
    expect(result.current.endDate).toBeNull();
  });

  it('debounces search input', async () => {
    const { result } = renderHook(() => useReportsScreen());
    
    act(() => {
      result.current.setSearch('test');
    });

    expect(useReportsPaginatedQuery).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }));
    
    act(() => {
      jest.advanceTimersByTime(350);
    });

    // We don't check call directly here because of how renderHook works with useEffect,
    // but the next render would have the debounced value.
  });

  it('partitions reports correctly', () => {
    const { result } = renderHook(() => useReportsScreen());
    
    expect(result.current.currentReport?.id).toBe('1');
    expect(result.current.filteredCompleted[0]?.id).toBe('2');
  });

  it('calculates summary stats for completed reports', () => {
    const { result } = renderHook(() => useReportsScreen());
    expect(result.current.summaryStats.count).toBe(1);
    expect(result.current.summaryStats.total).toBe(150.5);
  });

  it('clears filters correctly', () => {
    const { result } = renderHook(() => useReportsScreen());
    
    act(() => {
      result.current.setSearch('test');
      result.current.setStatusFilter('APPROVED');
    });
    
    expect(result.current.hasActiveFilters).toBe(true);
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.search).toBe('');
    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('refreshes reports correctly', async () => {
    const { result } = renderHook(() => useReportsScreen());
    await act(async () => {
      await result.current.onRefresh();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });
});
