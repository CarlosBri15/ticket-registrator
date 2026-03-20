import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Sub-component mocks ──────────────────────────────────────────────────────

vi.mock('./components/CompanyModeBanner', () => ({
  CompanyModeBanner: ({ orgName }: any) => <div data-testid="company-mode-banner">{orgName}</div>,
}));
vi.mock('./components/QuickActionsGrid', () => ({
  QuickActionsGrid: () => <div data-testid="quick-actions" />,
}));

// ─── Shared mock ──────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
  useUserQuery: vi.fn(),
  useUsersQuery: vi.fn(),
  useOrganizationsQuery: vi.fn(),
  useDepartmentsQuery: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
  usePermissions: vi.fn(),
  ReportStatus: {
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    CREATED: 'CREATED',
    DECLINED: 'DECLINED',
  },
}));

vi.mock('lucide-react', () => ({
  Wallet: () => null, Plane: () => null, AlertCircle: () => null, Plus: () => null,
  FileText: () => null, ArrowUpRight: () => null, ChevronRight: () => null,
  TrendingUp: () => null, Clock: () => null, Calendar: () => null,
  Receipt: () => null, Sparkles: () => null, Users: () => null, CheckCircle: () => null,
  Building2: () => null, Shield: () => null, Layers: () => null, Lock: () => null,
  BarChart2: () => null, Globe: () => null, Search: () => null, X: () => null,
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null, XAxis: () => null, YAxis: () => null, Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null, Cell: () => null, Legend: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      {value !== undefined && <span data-testid="stat-value">{value}</span>}
    </div>
  ),
}));
vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.name ? `${key} ${opts.name}` : key),
    i18n: { language: 'es' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import {
  useReportsQuery,
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useDepartmentsQuery,
  useScope,
  useScopeContext,
  usePermissions,
} from '@ticket-registrator/shared';
import { AdminDashboard } from './AdminDashboard';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupAdmin = (reports: any[] = [], users: any[] = [], departments: any[] = []) => {
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: reports, isLoading: false });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: users, isLoading: false });
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: departments, isLoading: false });
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Admin dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdmin();
  });

  it('renders AdminDashboard when user can view_users and approve_reports', () => {
    renderScreen();
    expect(screen.getByTestId('admin-stats')).toBeInTheDocument();
  });

  it('shows greeting with user name', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Laura Gómez', roleName: 'Admin' } });
    renderScreen();
    expect(screen.getByText(/Laura/)).toBeInTheDocument();
  });

  it('shows role name badge', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Laura', roleName: 'Admin' } });
    renderScreen();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows total users count in stats', () => {
    setupAdmin([], [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]);
    renderScreen();
    const statValues = screen.getAllByTestId('stat-value');
    expect(statValues[0].textContent).toBe('3');
  });

  it('shows total departments count in stats', () => {
    setupAdmin([], [], [{ id: 'd1', name: 'IT' }, { id: 'd2', name: 'Finance' }]);
    renderScreen();
    const statValues = screen.getAllByTestId('stat-value');
    expect(statValues[1].textContent).toBe('2');
  });

  it('shows pending-approvals-card in stats', () => {
    renderScreen();
    expect(screen.getByTestId('pending-approvals-card')).toBeInTheDocument();
  });

  it('shows "Todo al día" when no pending approvals', () => {
    setupAdmin([]);
    renderScreen();
    expect(screen.getByText('Todo al día')).toBeInTheDocument();
  });

  it('shows "Requieren revisión" when there are pending approvals', () => {
    setupAdmin([
      { id: 'r1', name: 'Viaje NY', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, currency: 'EUR' },
    ]);
    renderScreen();
    expect(screen.getByText('Requieren revisión')).toBeInTheDocument();
  });

  it('renders pending report in approval queue', () => {
    setupAdmin([
      { id: 'r1', name: 'Viaje NY', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, currency: 'EUR' },
    ]);
    renderScreen();
    expect(screen.getByText('Viaje NY')).toBeInTheDocument();
  });

  it('shows empty state when no pending approvals', () => {
    setupAdmin([]);
    renderScreen();
    expect(screen.getByText('home.noPendingApprovals')).toBeInTheDocument();
  });

  it('shows "no completed trips" in recent activity when no completed reports', () => {
    setupAdmin([]);
    renderScreen();
    expect(screen.getByText('trips.noCompletedTrips')).toBeInTheDocument();
  });

  it('renders completed report in recent activity', () => {
    setupAdmin([
      { id: 'r1', name: 'Viaje Roma', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 300, approved_amount: 300, currency: 'EUR' },
    ]);
    renderScreen();
    expect(screen.getByText('Viaje Roma')).toBeInTheDocument();
  });

  it('navigates to trip when pending approval is clicked', () => {
    setupAdmin([
      { id: 'r1', name: 'Viaje NY', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, currency: 'EUR' },
    ]);
    renderScreen();
    fireEvent.click(screen.getByText('Viaje NY'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips/r1');
  });

  it('navigates to /users when Equipo button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Equipo'));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('navigates to /trips when "Ver viajes" is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Ver viajes'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips');
  });

  it('shows loading skeleton while data loads', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('does not render global-stats section', () => {
    renderScreen();
    expect(screen.queryByTestId('global-stats')).not.toBeInTheDocument();
  });

  it('does not render company-mode-banner for regular admin', () => {
    renderScreen();
    expect(screen.queryByTestId('company-mode-banner')).not.toBeInTheDocument();
  });

  it('shows pending count badge in section header', () => {
    setupAdmin([
      { id: 'r1', name: 'V1', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 100, currency: 'EUR' },
      { id: 'r2', name: 'V2', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 200, currency: 'EUR' },
    ]);
    renderScreen();
    // '2' appears in both the card count and the section header badge
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2);
  });
});
