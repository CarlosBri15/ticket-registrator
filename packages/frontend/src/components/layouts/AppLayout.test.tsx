import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

const mockNavigate = vi.fn();
const mockCan = vi.fn().mockReturnValue(true);
const mockQueryClient = {
  clear: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet">outlet-content</div>,
  };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
  };
});

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUserQuery: vi.fn(),
    usePermissions: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
    useOrganizationsQuery: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('lucide-react', () => ({
  LayoutDashboard: () => null,
  FileText: () => null,
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
  Layers: () => null,
}));

vi.mock('../../api/client', () => ({
  tokenProvider: { removeToken: vi.fn() },
}));

vi.mock('../ui/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector" />,
}));

import {
  useUserQuery,
  usePermissions,
  useScope,
  useScopeContext,
  useOrganizationsQuery,
} from '@ticket-registrator/shared';
import { tokenProvider } from '../../api/client';

const mockUseUserQuery = useUserQuery as ReturnType<typeof vi.fn>;
const mockUsePermissions = usePermissions as ReturnType<typeof vi.fn>;
const mockUseScope = useScope as ReturnType<typeof vi.fn>;
const mockUseScopeContext = useScopeContext as ReturnType<typeof vi.fn>;
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
    // Default: regular user (not global, no active company)
    mockUseScope.mockReturnValue({ isGlobal: false, isSelf: false });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
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

  it('renders Reportes and Tickets for regular users', () => {
    mockUseScope.mockReturnValue({ isGlobal: false, isSelf: false });
    renderLayout();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  it('hides nav items when user lacks permission', () => {
    mockCan.mockReturnValue(false);
    renderLayout();
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('hides Usuarios for self-scope (regular employee) users', () => {
    mockUseScope.mockReturnValue({ isGlobal: false, isSelf: true });
    renderLayout();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('shows Usuarios for non-self-scope users (managers, admins)', () => {
    mockUseScope.mockReturnValue({ isGlobal: false, isSelf: false });
    renderLayout();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
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

  it('logout calls removeToken, clears queries and navigates to /login', () => {
    renderLayout();
    fireEvent.click(screen.getByText('settings.logout'));
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockQueryClient.clear).toHaveBeenCalled();
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
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // ── SuperAdmin global mode menu ──────────────────────────────────────────

  describe('SuperAdmin global mode', () => {
    beforeEach(() => {
      mockUseScope.mockReturnValue({ isGlobal: true, isSelf: false });
      mockUseScopeContext.mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
    });

    it('hides Reportes in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
    });

    it('hides Tickets in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Tickets')).not.toBeInTheDocument();
    });

    it('hides Departamentos in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Departamentos')).not.toBeInTheDocument();
    });

    it('hides Usuarios in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    });

    it('hides Roles in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Roles')).not.toBeInTheDocument();
    });

    it('hides Permisos in global mode', () => {
      renderLayout();
      expect(screen.queryByText('Permisos')).not.toBeInTheDocument();
    });

    it('still shows Dashboard in global mode', () => {
      renderLayout();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('still shows Organizaciones in global mode', () => {
      renderLayout();
      expect(screen.getByText('Organizaciones')).toBeInTheDocument();
    });

    it('shows global mode indicator label', () => {
      renderLayout();
      expect(screen.getByText(/Vista Global/i)).toBeInTheDocument();
    });
  });

  // ── SuperAdmin company mode ──────────────────────────────────────────────

  describe('SuperAdmin company mode', () => {
    beforeEach(() => {
      mockUseScope.mockReturnValue({ isGlobal: true, isSelf: false });
      mockUseScopeContext.mockReturnValue({ activeCompanyId: 'o1', setActiveCompanyId: vi.fn() });
      (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ id: 'o1', name: 'Acme Corp', createdAt: '', updatedAt: '' }],
        isLoading: false,
      });
    });

    it('shows sidebar company banner when company mode is active', () => {
      renderLayout();
      expect(screen.getByTestId('sidebar-company-banner')).toBeInTheDocument();
    });

    it('shows org name in sidebar banner', () => {
      renderLayout();
      const banner = screen.getByTestId('sidebar-company-banner');
      expect(banner.textContent).toContain('Acme Corp');
    });

    it('shows "Empresa activa" label in sidebar banner', () => {
      renderLayout();
      expect(screen.getByText('Empresa activa')).toBeInTheDocument();
    });

    it('calls setActiveCompanyId(null) when exit button is clicked in sidebar', () => {
      const mockSet = vi.fn();
      mockUseScopeContext.mockReturnValue({ activeCompanyId: 'o1', setActiveCompanyId: mockSet });
      renderLayout();
      fireEvent.click(screen.getByTitle('Salir de modo empresa'));
      expect(mockSet).toHaveBeenCalledWith(null);
    });

    it('shows Reportes in company mode (restored)', () => {
      renderLayout();
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });
  });
});
