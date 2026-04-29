import { renderHook, act } from '@testing-library/react-native';
import { useHomeScreen } from './useHomeScreen';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
  useUserQuery,
  useReportsQuery,
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  ReportStatus,
} from '@ticket-registrator/shared';

// Mocking dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useUserQuery: jest.fn(),
  useReportsQuery: jest.fn(),
  useUploadTicketMutation: jest.fn(),
  useUpdateTicketMutation: jest.fn(),
  useDeleteTicketMutation: jest.fn(),
  ReportStatus: {
    CREATED: 'CREATED',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
  },
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

describe('useHomeScreen', () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUserQuery as jest.Mock).mockReturnValue({ data: { name: 'John Doe' } });
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: [
        { id: '1', status: 'CREATED', requested_amount: 100 },
        { id: '2', status: 'APPROVED', requested_amount: 50 },
      ],
      isLoading: false,
      refetch: mockRefetch,
    });
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (useDeleteTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn() });
  });

  it('provides user initials and first name', () => {
    const { result } = renderHook(() => useHomeScreen());
    expect(result.current.userInitials).toBe('JD');
    expect(result.current.firstName).toBe('John');
  });

  it('identifies the active report', () => {
    const { result } = renderHook(() => useHomeScreen());
    expect(result.current.activeReport?.id).toBe('1');
  });

  it('calculates stats correctly', () => {
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: [
        { id: '1', status: 'CREATED', requested_amount: 100 },
        { id: '2', status: 'APPROVED', requested_amount: 50 },
        { id: '3', status: 'SUBMITTED', requested_amount: 200 },
      ],
      isLoading: false,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useHomeScreen());
    expect(result.current.stats.inReviewCount).toBe(1);
    expect(result.current.stats.inReview).toBe(200);
  });

  it('refreshes reports correctly', async () => {
    const { result } = renderHook(() => useHomeScreen());
    await act(async () => {
      await result.current.onRefresh();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles camera picking flow', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    });
    
    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    
    await act(async () => {
      await result.current.pickFromCamera();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it('handles gallery picking flow', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    });
    
    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    
    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it('shows error Alert if camera permission denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await result.current.pickFromCamera();
    });

    expect(Alert.alert).toHaveBeenCalledWith('common.error', expect.any(String));
  });

  it('does nothing in pickFromCamera when activeReport is null', async () => {
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    await act(async () => { await result.current.pickFromCamera(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does nothing in pickFromGallery when activeReport is null', async () => {
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    });
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    await act(async () => { await result.current.pickFromGallery(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows error Alert when gallery permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useHomeScreen());
    await act(async () => { await result.current.pickFromGallery(); });
    expect(Alert.alert).toHaveBeenCalledWith('common.error', expect.any(String));
  });

  it('does not call uploadTicket when camera result is canceled', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true });

    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    await act(async () => { await result.current.pickFromCamera(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not call uploadTicket when gallery result is canceled', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });

    const mutate = jest.fn();
    (useUploadTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    await act(async () => { await result.current.pickFromGallery(); });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('handleConfirm does nothing when extractedTicket or activeReport is null', () => {
    const updateMutate = jest.fn();
    (useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: updateMutate, isPending: false });

    const { result } = renderHook(() => useHomeScreen());
    act(() => { result.current.handleConfirm({ amount: 50 }); });
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('handleDiscard does nothing when extractedTicket or activeReport is null', () => {
    const deleteMutate = jest.fn();
    (useDeleteTicketMutation as jest.Mock).mockReturnValue({ mutate: deleteMutate });

    const { result } = renderHook(() => useHomeScreen());
    act(() => { result.current.handleDiscard(); });
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  it('recentCompleted filters reports correctly', () => {
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: [
        { id: '1', status: 'APPROVED', requested_amount: 100 },
        { id: '2', status: 'PAID', requested_amount: 200 },
        { id: '3', status: 'DECLINED', requested_amount: 50 },
        { id: '4', status: 'REJECTED', requested_amount: 75 },
        { id: '5', status: 'CREATED', requested_amount: 10 },
      ],
      isLoading: false,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useHomeScreen());
    expect(result.current.recentCompleted).toHaveLength(4);
    expect(result.current.recentCompleted.map((r: any) => r.id)).not.toContain('5');
  });

  it('returns default initials when user has no name', () => {
    (useUserQuery as jest.Mock).mockReturnValue({ data: {} });
    const { result } = renderHook(() => useHomeScreen());
    expect(result.current.userInitials).toBe('??');
    expect(result.current.firstName).toBe('');
  });

  it('setScanSheetOpen updates scanSheetOpen state', () => {
    const { result } = renderHook(() => useHomeScreen());
    act(() => { result.current.setScanSheetOpen(true); });
    expect(result.current.scanSheetOpen).toBe(true);
  });
});
