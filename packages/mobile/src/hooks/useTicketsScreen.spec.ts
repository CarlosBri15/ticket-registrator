import { renderHook, act } from '@testing-library/react-native';
import { useTicketsScreen } from './useTicketsScreen';
import { useReportsQuery } from '@ticket-registrator/shared';

jest.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: jest.fn(),
}));

describe('useTicketsScreen', () => {
  const mockRefetch = jest.fn();
  const mockReports = [{ id: '1', status: 'SUBMITTED', title: 'Test Report' }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: mockReports,
      isLoading: false,
      refetch: mockRefetch,
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTicketsScreen());
    expect(result.current.reports).toEqual(mockReports);
    expect(result.current.selectedTicket).toBeNull();
    expect(result.current.selectedReportId).toBe('');
    expect(result.current.isDetailOpen).toBe(false);
  });

  it('handles ticket press correctly', () => {
    const { result } = renderHook(() => useTicketsScreen());
    const mockTicket = { id: 't1' } as any;

    act(() => {
      result.current.handleTicketPress(mockTicket, '1');
    });

    expect(result.current.selectedTicket).toEqual(mockTicket);
    expect(result.current.selectedReportId).toBe('1');
    expect(result.current.isDetailOpen).toBe(true);
  });

  it('updates search correctly', () => {
    const { result } = renderHook(() => useTicketsScreen());
    act(() => {
      result.current.setSearch('test');
    });
    expect(result.current.search).toBe('test');
  });

  it('calls refetch correctly', () => {
    const { result } = renderHook(() => useTicketsScreen());
    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalled();
  });
});
