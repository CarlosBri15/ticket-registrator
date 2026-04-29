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

  it('hasFilters is true when ticketDate.start is set', () => {
    const { result } = renderHook(() => useTicketsScreen());
    act(() => { result.current.setTicketDate({ start: new Date(), end: null }); });
    expect(result.current.hasFilters).toBe(true);
  });

  it('hasFilters is true when uploadDate.end is set', () => {
    const { result } = renderHook(() => useTicketsScreen());
    act(() => { result.current.setUploadDate({ start: null, end: new Date() }); });
    expect(result.current.hasFilters).toBe(true);
  });

  it('filters tickets by search matching location_name', () => {
    const ticket = {
      id: 't1',
      report_id: '1',
      location_name: 'Madrid',
      expense_type: null,
      amount: 100,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      reportName: 'Report A',
    };
    (useQueries as jest.Mock).mockReturnValue([{ data: [ticket], isLoading: false }]);

    const { result } = renderHook(() => useTicketsScreen());
    act(() => { result.current.setSearch('madrid'); });
    expect(result.current.tickets).toHaveLength(1);

    act(() => { result.current.setSearch('nomatch'); });
    expect(result.current.tickets).toHaveLength(0);
  });

  it('filters tickets by reportFilter', () => {
    const ticket = {
      id: 't1',
      report_id: '1',
      location_name: 'A',
      expense_type: null,
      amount: 10,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      reportName: 'Report A',
    };
    (useQueries as jest.Mock).mockReturnValue([{ data: [ticket], isLoading: false }]);

    const { result } = renderHook(() => useTicketsScreen());
    act(() => { result.current.setReportFilter('99'); }); // wrong id
    expect(result.current.tickets).toHaveLength(0);

    act(() => { result.current.setReportFilter('1'); }); // correct id
    expect(result.current.tickets).toHaveLength(1);
  });

  it('filters tickets by ticketDate range (excludes out-of-range)', () => {
    const pastDate = new Date(2020, 0, 1).toISOString();
    const ticket = {
      id: 't2',
      report_id: '1',
      location_name: 'B',
      expense_type: null,
      amount: 20,
      createdAt: new Date().toISOString(),
      date: pastDate,
      reportName: 'Report A',
    };
    (useQueries as jest.Mock).mockReturnValue([{ data: [ticket], isLoading: false }]);

    const { result } = renderHook(() => useTicketsScreen());
    act(() => {
      result.current.setTicketDate({ start: new Date(2024, 0, 1), end: new Date(2024, 11, 31) });
    });
    expect(result.current.tickets).toHaveLength(0);
  });

  it('returns empty allTickets when reports is undefined', () => {
    (useReportsQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
    (useQueries as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useTicketsScreen());
    expect(result.current.tickets).toEqual([]);
  });

  it('isLoading is true while reports are loading', () => {
    (useReportsQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    const { result } = renderHook(() => useTicketsScreen());
    expect(result.current.isLoading).toBe(true);
  });
});
