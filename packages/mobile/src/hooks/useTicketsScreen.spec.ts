import { renderHook, act } from '@testing-library/react-native';

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest.fn().mockReturnValue([]),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: jest.fn(),
  api: {
    tickets: jest.fn().mockReturnValue({
      getByReport: jest.fn().mockResolvedValue([]),
    }),
  },
}));

import { useTicketsScreen } from './useTicketsScreen';
import { useReportsQuery } from '@ticket-registrator/shared';
import { useQueries } from '@tanstack/react-query';

describe('useTicketsScreen', () => {
  const mockReports = [{ id: '1', name: 'Report A', status: 'SUBMITTED' }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: mockReports,
      isLoading: false,
    });
    (useQueries as jest.Mock).mockReturnValue([]);
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTicketsScreen());
    expect(result.current.tickets).toEqual([]);
    expect(result.current.selectedTicket).toBeNull();
    expect(result.current.selectedReportId).toBe('');
    expect(result.current.isDetailOpen).toBe(false);
    expect(result.current.search).toBe('');
    expect(result.current.hasFilters).toBe(false);
  });

  it('exposes report options derived from reports', () => {
    const { result } = renderHook(() => useTicketsScreen());
    expect(result.current.reportOptions).toEqual([{ id: '1', name: 'Report A' }]);
  });

  it('handleTicketPress sets selected ticket and opens detail', () => {
    const { result } = renderHook(() => useTicketsScreen());
    const ticket = { id: 't1', report_id: 'r1' } as any;

    act(() => {
      result.current.handleTicketPress(ticket);
    });

    expect(result.current.selectedTicket).toEqual(ticket);
    expect(result.current.selectedReportId).toBe('r1');
    expect(result.current.isDetailOpen).toBe(true);
  });

  it('updates search correctly', () => {
    const { result } = renderHook(() => useTicketsScreen());
    act(() => {
      result.current.setSearch('test');
    });
    expect(result.current.search).toBe('test');
    expect(result.current.hasFilters).toBe(true);
  });

  it('clearFilters resets all filters', () => {
    const { result } = renderHook(() => useTicketsScreen());
    act(() => {
      result.current.setSearch('test');
      result.current.setReportFilter('1');
    });
    expect(result.current.hasFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });
    expect(result.current.search).toBe('');
    expect(result.current.reportFilter).toBeNull();
    expect(result.current.hasFilters).toBe(false);
  });
});
