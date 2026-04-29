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
});
