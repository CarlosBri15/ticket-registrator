import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mock ──────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useReportsQuery: vi.fn(),
    useUserQuery: vi.fn(),
    useScope: vi.fn(),
    usePermissions: vi.fn(),
    ReportStatus: {
      SUBMITTED: 'SUBMITTED',
      APPROVED: 'APPROVED',
      CREATED: 'CREATED',
      DECLINED: 'DECLINED',
    },
  };
});


vi.mock('./components/DashboardHero', () => ({
  DashboardHero: ({ firstName, user, actions }: any) => (
    <div>
      <span>{firstName}</span>
      <span>{user?.roleName}</span>
      {actions}
    </div>
  ),
}));

vi.mock('./components/PendingStatsCard', () => ({
  PendingStatsCard: ({ count, dataTestId }: any) => (
    <div data-testid="pending-approvals-card">
      <span data-testid={dataTestId}>{count}</span>
    </div>
  ),
}));

vi.mock('./components/ControllerStatsCards', () => ({
  WeeklyStatsCard: ({ count }: any) => (
    <div data-testid="stat-card">
      <span data-testid="stat-value">{count}</span>
    </div>
  ),
  PendingAmountCard: ({ amount }: any) => (
    <div data-testid="stat-card">
      <span data-testid="stat-value">{amount.toFixed(2)}</span>
      <span>€</span>
    </div>
  ),
}));

vi.mock('./components/PendingApprovalsList', () => ({
  PendingApprovalsList: ({ reports, navigate, viewAllPath, maxItems }: any) => (
    <div data-testid="approval-queue">
      {reports.length === 0 && <div data-testid="empty-queue" />}
      {reports.map((r: any) => (
        <div key={r.id} onClick={() => navigate(`/reports/${r.id}`)} style={{ cursor: 'pointer' }}>
          <span>{r.name}</span>
          <button>Revisar</button>
        </div>
      ))}
      {reports.length > (maxItems || 8) && (
        <button onClick={() => navigate(viewAllPath || '/reports')}>
          Ver todos ({reports.length})
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
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

// date-fns: mock isThisWeek so we can control it; format is kept real
vi.mock('date-fns', async () => {
  const actual = await vi.importActual<typeof import('date-fns')>('date-fns');
  return {
    ...actual,
    isThisWeek: vi.fn((d: Date) => {
      // default: return true for dates in 2099 (used for "this week" test reports)
      return d.getFullYear() === 2099;
    }),
  };
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import {
  useReportsQuery,
  useUserQuery,
} from '@ticket-registrator/shared';
import { ControllerDashboard } from './ControllerDashboard';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = (
  reports: any[] = [],
  user: any = { name: 'Carlos', roleName: 'Controller' },
) => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: reports, isLoading: false });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: user });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <ControllerDashboard />
    </MemoryRouter>,
  );

// ─── Report factories ─────────────────────────────────────────────────────────

const makeReport = (overrides: Partial<{
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  requested_amount: number;
  currency: string;
  updatedAt: string;
}> = {}) => ({
  id: 'r1',
  name: 'Viaje Test',
  status: 'SUBMITTED',
  start_date: '2024-01-01',
  end_date: '2024-01-10',
  requested_amount: 100,
  currency: 'EUR',
  updatedAt: '2024-01-10T00:00:00.000Z',
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ControllerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('shows loading skeleton when isLoading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows Controller greeting with user name', () => {
    setupMocks([], { name: 'Carlos López', roleName: 'Controller' });
    renderScreen();
    expect(screen.getByText(/Carlos/)).toBeInTheDocument();
  });

  it('shows role badge', () => {
    setupMocks([], { name: 'Carlos', roleName: 'Controller' });
    renderScreen();
    expect(screen.getByText('Controller')).toBeInTheDocument();
  });

  it('renders controller-stats section', () => {
    renderScreen();
    expect(screen.getByTestId('controller-stats')).toBeInTheDocument();
  });

  it('shows empty-queue empty state when no pending reports', () => {
    setupMocks([]);
    renderScreen();
    expect(screen.getByTestId('empty-queue')).toBeInTheDocument();
  });

  it('shows pending report names in approval queue', () => {
    setupMocks([makeReport({ id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED' })]);
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('clicking a pending report navigates to /reports/:id', () => {
    setupMocks([makeReport({ id: 'r42', name: 'Viaje Roma', status: 'SUBMITTED' })]);
    renderScreen();
    fireEvent.click(screen.getByText('Viaje Roma'));
    expect(mockNavigate).toHaveBeenCalledWith('/reports/r42');
  });

  it('shows "Revisar" button for each pending report', () => {
    setupMocks([
      makeReport({ id: 'r1', status: 'SUBMITTED', name: 'Viaje A' }),
      makeReport({ id: 'r2', status: 'SUBMITTED', name: 'Viaje B' }),
    ]);
    renderScreen();
    const revisarButtons = screen.getAllByText(/Revisar/);
    expect(revisarButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('"Ver todos" button appears when pending > 8 and navigates to /reports', () => {
    const manyPending = Array.from({ length: 9 }, (_, i) =>
      makeReport({ id: `r${i}`, status: 'SUBMITTED', name: `Viaje ${i}` }),
    );
    setupMocks(manyPending);
    renderScreen();
    // The "Ver todos (9)" link appears at the bottom of the approval queue
    const verTodosBtn = screen.getAllByText(/Ver todos/).find(
      (el) => el.textContent?.includes('9'),
    );
    expect(verTodosBtn).toBeDefined();
    fireEvent.click(verTodosBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/reports?status=SUBMITTED');
  });

  it('shows approved this week count', () => {
    // Year 2099 → isThisWeek mock returns true
    setupMocks([
      makeReport({ id: 'r1', status: 'APPROVED', updatedAt: '2099-01-10T00:00:00.000Z' }),
      makeReport({ id: 'r2', status: 'APPROVED', name: 'Otro', updatedAt: '2099-01-11T00:00:00.000Z' }),
    ]);
    renderScreen();
    // The approved this week stat card shows "2"
    const stats = screen.getByTestId('controller-stats');
    expect(stats.textContent).toContain('2');
  });

  it('shows declined this week count', () => {
    setupMocks([
      makeReport({ id: 'r1', status: 'DECLINED', updatedAt: '2099-01-10T00:00:00.000Z' }),
    ]);
    renderScreen();
    const stats = screen.getByTestId('controller-stats');
    expect(stats.textContent).toContain('1');
  });

  it('shows recently processed reports', () => {
    setupMocks([
      makeReport({ id: 'r1', status: 'APPROVED', name: 'Viaje Procesado' }),
    ]);
    renderScreen();
    expect(screen.getByText('Viaje Procesado')).toBeInTheDocument();
  });

  it('does NOT show empty-queue when there are pending reports', () => {
    setupMocks([makeReport({ id: 'r1', status: 'SUBMITTED' })]);
    renderScreen();
    expect(screen.queryByTestId('empty-queue')).not.toBeInTheDocument();
  });

  it('renders approval-queue section', () => {
    renderScreen();
    expect(screen.getByTestId('approval-queue')).toBeInTheDocument();
  });

});
