import { renderHook, act } from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'es', changeLanguage: jest.fn() },
    t: (key: string) => key,
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useUserQuery: jest.fn(),
  useUpdateUserMutation: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../api/client', () => ({
  tokenProvider: {
    removeToken: jest.fn(),
  },
}));

import { useProfileScreen } from './useProfileScreen';
import { useUserQuery, useUpdateUserMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { tokenProvider } from '../api/client';

const mockReplace = jest.fn();
const mockRemoveToken = tokenProvider.removeToken as jest.Mock;
(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

describe('useProfileScreen', () => {
  const mockRefetch = jest.fn();
  const mockUser = { id: 'u1', name: 'John Doe', email: 'john@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockRemoveToken.mockResolvedValue(undefined);
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      refetch: mockRefetch,
    });
    (useUpdateUserMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides user data and initials', () => {
    const { result } = renderHook(() => useProfileScreen());
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.userInitials).toBe('JD');
  });

  it('starts editing correctly', () => {
    const { result } = renderHook(() => useProfileScreen());
    
    act(() => {
      result.current.startEdit();
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.name).toBe('John Doe');
  });

  it('updates form correctly', () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.setForm({ ...result.current.form, name: 'New Name' });
    });
    expect(result.current.form.name).toBe('New Name');
  });

  it('calls updateUser correctly on save', () => {
    const mutate = jest.fn();
    (useUpdateUserMutation as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
    });
    
    const { result } = renderHook(() => useProfileScreen());
    
    act(() => {
      result.current.startEdit();
      result.current.setForm({ ...result.current.form, name: 'New Name' });
    });
    
    act(() => {
      result.current.handleSave();
    });
    
    expect(mutate).toHaveBeenCalledWith({
      id: 'u1',
      data: expect.objectContaining({ name: 'New Name' }),
    });
  });

  it('handles logout correctly', async () => {
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
