import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
}));

vi.mock('../../api/client', () => ({
  tokenProvider: { removeToken: vi.fn() },
}));

import { useUserQuery } from '@ticket-registrator/shared';
import { tokenProvider } from '../../api/client';
const mockUseUserQuery = useUserQuery as ReturnType<typeof vi.fn>;
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
});
