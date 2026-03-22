import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsScreen } from './SettingsScreen';

const mockNavigate = vi.fn();
const mockChangeLanguage = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@ticket-registrator/shared', () => ({
  useUserQuery: vi.fn(),
  useUpdateUserMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es', changeLanguage: mockChangeLanguage },
  }),
}));

vi.mock('lucide-react', () => ({
  Globe: () => <span data-testid="globe-icon" />,
  User: () => <span data-testid="user-icon" />,
  LogOut: () => <span data-testid="logout-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Mail: () => <span data-testid="mail-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  X: () => <span data-testid="x-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  Key: () => <span data-testid="key-icon" />,
}));

vi.mock('../../api/client', () => ({
  tokenProvider: { removeToken: vi.fn() },
}));

import { useUserQuery, useUpdateUserMutation } from '@ticket-registrator/shared';
import { tokenProvider } from '../../../api/client';
const mockUseUserQuery = useUserQuery as ReturnType<typeof vi.fn>;
const mockUseUpdateUserMutation = useUpdateUserMutation as ReturnType<typeof vi.fn>;
const mockRemoveToken = (tokenProvider as any).removeToken as ReturnType<typeof vi.fn>;

const renderSettings = () =>
  render(
    <MemoryRouter>
      <SettingsScreen />
    </MemoryRouter>,
  );

describe('SettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserQuery.mockReturnValue({ data: null });
  });

  it('renders settings title', () => {
    renderSettings();
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('renders profile section heading', () => {
    renderSettings();
    expect(screen.getByText('settings.profile')).toBeInTheDocument();
  });

  it('renders language section heading', () => {
    renderSettings();
    expect(screen.getByText('settings.language')).toBeInTheDocument();
  });

  it('shows placeholder when no user data', () => {
    renderSettings();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows user name when user is loaded', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'John Doe', email: 'john@example.com' } });
    renderSettings();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows user email when user is loaded', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@empresa.com' } });
    renderSettings();
    expect(screen.getByText('ana@empresa.com')).toBeInTheDocument();
  });

  it('renders Español and English language buttons', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: /español/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
  });

  it('calls changeLanguage with "en" when English is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls changeLanguage with "es" when Español is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /español/i }));
    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
  });

  it('renders logout button', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: /settings.logout/i })).toBeInTheDocument();
  });

  it('logout button calls removeToken and navigates to /login', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /settings.logout/i }));
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows user initials in avatar', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana García', email: 'ana@test.com' } });
    renderSettings();
    expect(screen.getByText('AG')).toBeInTheDocument();
  });

  it('shows ? when no user data for initials', () => {
    mockUseUserQuery.mockReturnValue({ data: null });
    renderSettings();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows edit profile button when not editing', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com' } });
    renderSettings();
    expect(screen.getByText('settings.editProfile')).toBeInTheDocument();
  });

  it('shows edit form when edit button is clicked', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com', id: 'u1' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    expect(screen.getByText('settings.saveChanges')).toBeInTheDocument();
    expect(screen.getByText('settings.cancelEdit')).toBeInTheDocument();
  });

  it('cancel edit hides the edit form', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com', id: 'u1' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    fireEvent.click(screen.getByText('settings.cancelEdit'));
    expect(screen.queryByText('settings.saveChanges')).not.toBeInTheDocument();
    expect(screen.getByText('settings.editProfile')).toBeInTheDocument();
  });

  it('calls updateMutation.mutate on form submit', () => {
    const mockMutate = vi.fn();
    mockUseUpdateUserMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com', id: 'u1' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    const form = screen.getByText('settings.saveChanges').closest('form')!;
    fireEvent.submit(form);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', data: expect.objectContaining({ name: 'Ana', email: 'ana@test.com' }) }),
    );
  });

  it('shows role name badge when user has a role', () => {
    mockUseUserQuery.mockReturnValue({
      data: { name: 'Ana', email: 'ana@test.com', roleName: 'Manager' },
    });
    renderSettings();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('shows permissions count when user has permissions', () => {
    mockUseUserQuery.mockReturnValue({
      data: { name: 'Ana', email: 'ana@test.com', permissions: ['p1', 'p2', 'p3'] },
    });
    renderSettings();
    // The key is rendered via t() which returns the key in test mode
    expect(screen.getByText(/settings.permissionsCount/)).toBeInTheDocument();
  });

  it('shows saveOk success badge after onSuccess is called', () => {
    let capturedOnSuccess: (() => void) | undefined;
    mockUseUpdateUserMutation.mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate: vi.fn(), isPending: false };
    });
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com', id: 'u1' } });
    renderSettings();
    act(() => { capturedOnSuccess?.(); });
    expect(screen.getByText('settings.updateSuccess')).toBeInTheDocument();
  });

  it('shows hierarchy level when user has hierarchy', () => {
    mockUseUserQuery.mockReturnValue({
      data: { name: 'Ana', email: 'ana@test.com', roleName: 'Manager', hierarchy: 50 },
    });
    renderSettings();
    expect(screen.getByText(/settings.hierarchyLevel/)).toBeInTheDocument();
  });

  it('startEdit fills empty string when user has no name or email', () => {
    mockUseUserQuery.mockReturnValue({ data: { id: 'u1' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    expect(screen.getByText('settings.saveChanges')).toBeInTheDocument();
  });

  it('handleSave returns early without calling mutate when user has no id', () => {
    const mockMutate = vi.fn();
    mockUseUpdateUserMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana', email: 'ana@test.com' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    const form = screen.getByText('settings.saveChanges').closest('form')!;
    fireEvent.submit(form);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('handleSave sends empty payload when form fields are empty', () => {
    const mockMutate = vi.fn();
    mockUseUpdateUserMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    mockUseUserQuery.mockReturnValue({ data: { id: 'u1', name: '', email: '' } });
    renderSettings();
    fireEvent.click(screen.getByText('settings.editProfile'));
    const form = screen.getByText('settings.saveChanges').closest('form')!;
    fireEvent.submit(form);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', data: {} }),
    );
  });
});
