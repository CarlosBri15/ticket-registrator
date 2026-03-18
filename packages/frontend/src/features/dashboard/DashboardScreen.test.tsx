import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
  useUserQuery: vi.fn(),
  useTicketsQuery: vi.fn(),
  useUsersQuery: vi.fn(),
  useScope: vi.fn(),
  usePermissions: vi.fn(),
  ReportStatus: {
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    CREATED: 'CREATED',
  },
}));

vi.mock('lucide-react', () => ({
  Wallet: () => null,
  Plane: () => null,
  AlertCircle: () => null,
  Plus: () => null,
  FileText: () => null,
  ArrowUpRight: () => null,
  ChevronRight: () => null,
  TrendingUp: () => null,
  Clock: () => null,
  Calendar: () => null,
  Receipt: () => null,
  Sparkles: () => null,
  Users: () => null,
  CheckCircle: () => null,
  Building2: () => null,
  Shield: () => null,
  Layers: () => null,
  Lock: () => null,
  BarChart2: () => null,
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ title }: any) => <div data-testid="stat-card">{title}</div>,
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

import {
  useReportsQuery,
  useUserQuery,
  useTicketsQuery,
  useUsersQuery,
  useScope,
  usePermissions,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
  (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders greeting', () => {
    renderScreen();
    // greeting key rendered via t()
    const hasGreeting =
      screen.queryByText(/home\.greeting/i) !== null ||
      screen.queryByText(/Usuario/i) !== null;
    expect(hasGreeting).toBe(true);
  });

  it('renders StatCards for pending and approved amounts', () => {
    renderScreen();
    const statCards = screen.getAllByTestId('stat-card');
    expect(statCards.length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading skeleton when loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows user name in greeting when user data exists', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Carlos López' } });
    renderScreen();
    expect(screen.getByText(/carlos/i)).toBeInTheDocument();
  });

  it('renders active trip section when active reports exist (self scope)', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{
        id: 'r1', name: 'Viaje París', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-10',
        requested_amount: 500, approved_amount: null, currency: 'EUR',
      }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje París')).toBeInTheDocument();
  });

  it('renders team stats when not self scope', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 300, approved_amount: null, currency: 'EUR' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getAllByTestId('stat-card').length).toBeGreaterThanOrEqual(1);
  });

  it('renders analytics section when reports have data', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Report 1', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Business Trip' },
        { id: 'r2', name: 'Report 2', status: 'APPROVED', start_date: '2024-02-01', end_date: '2024-02-10', requested_amount: 200, approved_amount: 200, currency: 'EUR', type: 'Training' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders approved amount banner when team stats with approved reports', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Report 1', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Business' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText(/home\.totalApproved/i)).toBeInTheDocument();
  });

  it('renders pending approvals list when canApprove and team stats', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Report Pending', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 300, approved_amount: null, currency: 'EUR' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Report Pending')).toBeInTheDocument();
  });

  it('shows no active trips empty state for self scope with no active reports', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    renderScreen();
    expect(screen.getByText('trips.noActiveTrips')).toBeInTheDocument();
  });

  it('renders UserKpis with rejected count > 0 for self scope with declined report', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Viaje Rechazado', status: 'DECLINED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 200, approved_amount: null, currency: 'EUR' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('home.requiresAttention')).toBeInTheDocument();
  });

  it('shows team reports label when not canApprove but showTeamStats', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    renderScreen();
    expect(screen.getByText('home.teamReports')).toBeInTheDocument();
  });

  it('renders user roleName badge when user has roleName', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Ana', roleName: 'Manager' } });
    renderScreen();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('shows analytics noData in bar chart when reports have type but no end_date', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Report 1', status: 'APPROVED', start_date: '2024-01-01', end_date: null, requested_amount: 500, approved_amount: 500, currency: 'EUR', type: 'Business Trip' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('analytics.noData')).toBeInTheDocument();
  });

  it('shows active trip card and clicking it does not crash', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje París', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-10', requested_amount: 500, approved_amount: null, currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('Viaje París'));
    expect(screen.getByText('Viaje París')).toBeInTheDocument();
  });
});
