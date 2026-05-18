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
  useDeleteReportMutation,
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
  useDeleteReportMutation: jest.fn(),
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
    (useDeleteReportMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
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

  it('isEditable is false for non-editable statuses', () => {
    (useReportQuery as jest.Mock).mockReturnValue({
      data: { id: reportId, status: 'SUBMITTED' },
      isLoading: false,
      refetch: mockRefetchReport,
    });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.isEditable).toBe(false);
    expect(result.current.canSubmit).toBe(false);
  });

  it('canSubmit is false when tickets list is empty', () => {
    (useTicketsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetchTickets,
    });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.canSubmit).toBe(false);
  });

  it('ticketsTotal is 0 when no tickets', () => {
    (useTicketsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetchTickets,
    });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.ticketsTotal).toBe(0);
  });

  it('ticketsTotal is 0 when tickets is undefined', () => {
    (useTicketsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: mockRefetchTickets,
    });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    expect(result.current.ticketsTotal).toBe(0);
  });

  it('handleConfirm does nothing when extractedTicket is null', () => {
    const updateMutate = jest.fn();
    (useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: updateMutate, isPending: false });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    act(() => { result.current.handleConfirm({ amount: 10 }); });
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('handleDiscard does nothing when extractedTicket is null', () => {
    const deleteMutate = jest.fn();
    (useDeleteTicketMutation as jest.Mock).mockReturnValue({ mutate: deleteMutate });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    act(() => { result.current.handleDiscard(); });
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  it('shows camera permission error when denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    await act(async () => { await result.current.pickFromCamera(); });
    expect(Alert.alert).toHaveBeenCalledWith('common.error', expect.any(String));
  });

  it('shows gallery permission error when denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    await act(async () => { await result.current.pickFromGallery(); });
    expect(Alert.alert).toHaveBeenCalledWith('common.error', expect.any(String));
  });

  it('does not upload when camera is canceled', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true });
    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    await act(async () => { await result.current.pickFromCamera(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not upload when gallery is canceled', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });
    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    await act(async () => { await result.current.pickFromGallery(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('setIsModalOpen closes the modal', () => {
    const { result } = renderHook(() => useReportDetailScreen(reportId));
    act(() => { result.current.setIsModalOpen(true); });
    expect(result.current.isModalOpen).toBe(true);
    act(() => { result.current.setIsModalOpen(false); });
    expect(result.current.isModalOpen).toBe(false);
  });
});
