import { renderHook, act } from '@testing-library/react-native';
import { useReportDetailScreen } from './useReportDetailScreen';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  useReportQuery,
  useTicketsQuery,
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useSubmitReportMutation,
} from '@ticket-registrator/shared';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useReportQuery: jest.fn(),
  useTicketsQuery: jest.fn(),
  useUploadTicketMutation: jest.fn(),
  useUpdateTicketMutation: jest.fn(),
  useDeleteTicketMutation: jest.fn(),
  useSubmitReportMutation: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

describe('useReportDetailScreen', () => {
  const reportId = 'r1';
  const mockRefetchReport = jest.fn();
  const mockRefetchTickets = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useReportQuery as jest.Mock).mockReturnValue({
      data: { id: reportId, status: 'CREATED' },
      isLoading: false,
      refetch: mockRefetchReport,
    });
    (useTicketsQuery as jest.Mock).mockReturnValue({
      data: [{ id: 't1', amount: 50 }, { id: 't2', amount: 25 }],
      isLoading: false,
      refetch: mockRefetchTickets,
    });
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (useDeleteTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (useSubmitReportMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('provides report and tickets data', () => {
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.report?.id).toBe(reportId);
    expect(result.current.tickets?.length).toBe(2);
    expect(result.current.ticketsTotal).toBe(75);
  });

  it('determines if report is editable and can be submitted', () => {
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.isEditable).toBe(true);
    expect(result.current.canSubmit).toBe(true);
  });

  it('handles submit report action with alert confirmation', () => {
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    
    act(() => {
      result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'reportDetail.submitReport',
      'reportDetail.confirmSubmit',
      expect.any(Array)
    );
  });

  it('handles camera picker correctly', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    });
    
    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useReportDetailScreen(reportId));
    
    await act(async () => {
      await result.current.pickFromCamera();
    });

    expect(mutate).toHaveBeenCalledWith({
      reportId,
      formData: expect.any(FormData),
    });
  });

  it('handles ticket selection', () => {
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    const mockTicket = { id: 't1' } as any;

    act(() => {
      result.current.setSelectedTicket(mockTicket);
      result.current.setIsDetailOpen(true);
    });

    expect(result.current.selectedTicket).toEqual(mockTicket);
    expect(result.current.isDetailOpen).toBe(true);
  });
});
