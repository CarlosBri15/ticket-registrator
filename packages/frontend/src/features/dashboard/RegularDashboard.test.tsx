import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Sub-component mocks ──────────────────────────────────────────────────────

vi.mock('./components/CompanyModeBanner', () => ({
  CompanyModeBanner: ({ orgName, onExit, onDetail }: any) => (
    <div data-testid="company-mode-banner">
      <span>Modo empresa</span>
      <button data-testid="company-mode-exit" onClick={onExit}>Vista global</button>
      <button onClick={onDetail}>Detalle</button>
      <span>{orgName}</span>
    </div>
  ),
}));
vi.mock('./components/ActiveTripCard', () => ({
  ActiveTripCard: ({ currentTrip }: any) => <div>{currentTrip.name}</div>,
}));
vi.mock('./components/PendingApprovalsList', () => ({
  PendingApprovalsList: ({ reports, navigate, title }: any) => (
    <div>
      {title && <h2>{title}</h2>}
      {reports.map((r: any) => (
        <button key={r.id} onClick={() => navigate(`/trips/${r.id}`)}>{r.name}</button>
      ))}
    </div>
  ),
}));
vi.mock('./components/QuickActionsGrid', () => ({
  QuickActionsGrid: () => <div data-testid="quick-actions" />,
}));
// ─── Shared mock ──────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
  useUserQuery: vi.fn(),
  useTicketsQuery: vi.fn(),
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
  StatCard: ({ title, value, subtitle }: any) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      {value !== undefined && <span data-testid="stat-value">{value}</span>}
      {subtitle && <span>{subtitle}</span>}
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
  useScope,
  useScopeContext,
  usePermissions,
} from '@ticket-registrator/shared';
import { RegularDashboard } from './RegularDashboard';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
  // Default: non-admin user (can't approve, can't view users)
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <RegularDashboard />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Regular dashboard (non-SuperAdmin or company mode) ───────────────────

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders greeting', () => {
    renderScreen();
    const hasGreeting =
      screen.queryByText(/home\.greeting/i) !== null ||
      screen.queryByText(/Usuario/i) !== null;
    expect(hasGreeting).toBe(true);
  });

  it('renders StatCards', () => {
    renderScreen();
    expect(screen.getAllByTestId('stat-card').length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading skeleton when loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows user name in greeting', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Carlos López' } });
    renderScreen();
    expect(screen.getByText(/carlos/i)).toBeInTheDocument();
  });

  it('renders active trip for self scope', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true, isGlobal: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje París', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje París')).toBeInTheDocument();
  });

  it('renders team stats when not self scope', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 300, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getAllByTestId('stat-card').length).toBeGreaterThanOrEqual(1);
  });

  it('renders bar chart when approved reports exist', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'R1', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Business' },
        { id: 'r2', name: 'R2', status: 'APPROVED', start_date: '2024-02-01', end_date: '2024-02-10', requested_amount: 200, approved_amount: 200, currency: 'EUR', type: 'Training' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders approved amount banner for team with approved reports', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
    // Only approve_reports, not view_users → stays on RegularDashboard (not AdminDashboard)
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: (p: string) => p === 'approve_reports' });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'R1', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Biz' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText(/home\.totalApproved/i)).toBeInTheDocument();
  });

  it('renders pending approvals list when canApprove', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Pendiente', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 300, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows no active trips empty state for self scope', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true, isGlobal: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    renderScreen();
    expect(screen.getByText('trips.noActiveTrips')).toBeInTheDocument();
  });

  it('shows requiresAttention for self scope with declined report', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true, isGlobal: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Rechazado', status: 'DECLINED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 200, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('home.requiresAttention')).toBeInTheDocument();
  });

  it('shows team reports label when cannot approve', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    renderScreen();
    expect(screen.getByText('home.teamReports')).toBeInTheDocument();
  });

  it('renders user roleName badge', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Ana', roleName: 'Manager' } });
    renderScreen();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('shows analytics noData when reports have type but no end_date', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'R1', status: 'APPROVED', start_date: '2024-01-01', end_date: null, requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Biz' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('analytics.noData')).toBeInTheDocument();
  });

  it('clicking active trip card does not crash', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true, isGlobal: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje París', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('Viaje París'));
    expect(screen.getByText('Viaje París')).toBeInTheDocument();
  });

  // ── Company mode (SuperAdmin activated a company) ─────────────────────────

  describe('Company mode banner', () => {
    const setupCompanyMode = (orgName = 'Acme Corp') => {
      (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: true });
      (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'o1', setActiveCompanyId: vi.fn() });
      (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ id: 'o1', name: orgName, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        isLoading: false,
      });
      (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
      (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
    };

    it('renders RegularDashboard (not global dashboard) when activeCompanyId is set', () => {
      setupCompanyMode();
      renderScreen();
      // Regular dashboard shows the normal greeting header (not global-stats)
      expect(screen.queryByTestId('global-stats')).not.toBeInTheDocument();
    });

    it('shows company mode banner when SuperAdmin has an active company', () => {
      setupCompanyMode('Acme Corp');
      renderScreen();
      expect(screen.getByTestId('company-mode-banner')).toBeInTheDocument();
    });

    it('shows org name in company mode banner', () => {
      setupCompanyMode('Acme Corp');
      renderScreen();
      const banner = screen.getByTestId('company-mode-banner');
      expect(banner.textContent).toContain('Acme Corp');
    });

    it('shows "Modo empresa" label in banner', () => {
      setupCompanyMode();
      renderScreen();
      expect(screen.getByText('Modo empresa')).toBeInTheDocument();
    });

    it('calls setActiveCompanyId(null) when "Vista global" is clicked', () => {
      const mockSet = vi.fn();
      (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: true });
      (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'o1', setActiveCompanyId: mockSet });
      (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        isLoading: false,
      });
      (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
      (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
      renderScreen();
      fireEvent.click(screen.getByTestId('company-mode-exit'));
      expect(mockSet).toHaveBeenCalledWith(null);
    });

    it('navigates to org detail when "Detalle" is clicked', () => {
      setupCompanyMode('Acme Corp');
      renderScreen();
      fireEvent.click(screen.getByText('Detalle'));
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/o1');
    });

    it('does not show company mode banner for non-SuperAdmin', () => {
      (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false, isGlobal: false });
      (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'o1', setActiveCompanyId: vi.fn() });
      (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
      (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
      renderScreen();
      expect(screen.queryByTestId('company-mode-banner')).not.toBeInTheDocument();
    });
  });
});
