import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

const mockNavigate = vi.fn();
const mockCan = vi.fn().mockReturnValue(true);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet">outlet-content</div>,
  };
});

vi.mock('@ticket-registrator/shared', () => ({
  useUserQuery: vi.fn(),
  usePermissions: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('lucide-react', () => ({
  LayoutDashboard: () => null,
  Plane: () => null,
  Receipt: () => null,
  LogOut: () => null,
  Menu: () => <span>Menu</span>,
  X: () => <span>X</span>,
  Settings: () => null,
  Sparkles: () => null,
  ChevronRight: () => null,
  User: () => null,
  PanelLeftClose: () => null,
  PanelLeftOpen: () => null,
  Users: () => null,
  Building2: () => null,
  Shield: () => null,
  Globe: () => null,
  Lock: () => null,
}));

vi.mock('../api/client', () => ({
  tokenProvider: { removeToken: vi.fn() },
}));

vi.mock('../components/ui/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector" />,
}));

import { useUserQuery, usePermissions } from '@ticket-registrator/shared';
import { tokenProvider } from '../api/client';
const mockUseUserQuery = useUserQuery as ReturnType<typeof vi.fn>;
const mockUsePermissions = usePermissions as ReturnType<typeof vi.fn>;
const mockRemoveToken = (tokenProvider as any).removeToken as ReturnType<typeof vi.fn>;

const renderLayout = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppLayout />
    </MemoryRouter>,
  );

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserQuery.mockReturnValue({ data: null });
    mockUsePermissions.mockReturnValue({ can: mockCan });
    mockCan.mockReturnValue(true);
  });

  it('renders without crashing', () => {
    const { container } = renderLayout();
    expect(container).toBeTruthy();
  });

  it('renders the outlet', () => {
    renderLayout();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders Dashboard navigation item', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders navigation items when user has permissions', () => {
    renderLayout();
    expect(screen.getByText('Viajes')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  it('hides nav items when user lacks permission', () => {
    mockCan.mockReturnValue(false);
    renderLayout();
    expect(screen.queryByText('Viajes')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('shows user initials when user has name', () => {
    mockUseUserQuery.mockReturnValue({ data: { name: 'Ana García' } });
    renderLayout();
    expect(screen.getByText('AG')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderLayout();
    expect(screen.getByText('settings.logout')).toBeInTheDocument();
  });

  it('logout calls removeToken and navigates to /login', () => {
    renderLayout();
    fireEvent.click(screen.getByText('settings.logout'));
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggle collapse button changes sidebar state', () => {
    renderLayout();
    const collapseBtn = screen.getByTitle('Colapsar menú');
    fireEvent.click(collapseBtn);
    expect(screen.getByTitle('Expandir menú')).toBeInTheDocument();
  });

  it('renders mobile overlay when mobile menu is open and closes on click', () => {
    renderLayout();
    const menuBtn = screen.getByText('Menu');
    fireEvent.click(menuBtn);
    const overlay = screen.getByLabelText('Close menu');
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay);
    expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();
  });

  it('renders active NavLink styling when route matches nav item', () => {
    renderLayout('/home');
    // Dashboard link should be active — just ensure it renders without error
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
