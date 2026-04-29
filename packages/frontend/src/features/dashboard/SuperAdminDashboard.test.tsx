import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && 'count' in opts) return `${key}:${opts.count}`;
      if (opts && 'filtered' in opts) return `${key}:${opts.filtered}/${opts.total}`;
      return key;
    },
    i18n: { language: 'es' },
  }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUserQuery: vi.fn(),
    useUsersQuery: vi.fn(),
    useOrganizationsQuery: vi.fn(),
    useScopeContext: vi.fn(),
  };
});

vi.mock('recharts', () => {
  const Comp = ({ children }: any) => <div>{children}</div>;
  return {
    ResponsiveContainer: Comp,
    BarChart: Comp,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

vi.mock('./components/DashboardHero', () => ({
  DashboardHero: ({ firstName, actions }: any) => (
    <div data-testid="hero">
      <span>{firstName}</span>
      {actions}
    </div>
  ),
}));

vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ title, value, subtitle }: any) => (
    <div data-testid="stat-card">
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value">{value}</span>
      <span data-testid="stat-subtitle">{subtitle}</span>
    </div>
  ),
}));

vi.mock('../../components/ui/SectionCard', () => ({
  SectionCard: ({ title, children }: any) => (
    <div data-testid="section-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

vi.mock('../../components/ui/SearchInput', () => ({
  SearchInput: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

import {
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScopeContext,
} from '@ticket-registrator/shared';
import { SuperAdminGlobalDashboard } from './SuperAdminDashboard';

const setActiveCompanyId = vi.fn();

const setupMocks = (opts: { orgs?: any[]; users?: any[]; loading?: boolean } = {}) => {
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: { name: 'Ana García', roleName: 'SuperAdmin' },
  });
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: opts.orgs ?? [],
    isLoading: opts.loading ?? false,
  });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: opts.users ?? [],
    isLoading: opts.loading ?? false,
  });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({
    setActiveCompanyId,
  });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <SuperAdminGlobalDashboard />
    </MemoryRouter>,
  );

describe('SuperAdminGlobalDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    setupMocks();
  });

  it('renders the dashboard hero with user first name', () => {
    renderScreen();
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('renders the global stats grid', () => {
    renderScreen();
    expect(screen.getByTestId('global-stats')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card').length).toBeGreaterThanOrEqual(2);
  });

  it('renders org and user counters in stat cards', () => {
    setupMocks({
      orgs: [{ id: 'o1', name: 'Org 1', createdAt: '2024-01-15T00:00:00Z' }],
      users: [{ id: 'u1', companyId: 'o1' }, { id: 'u2', companyId: 'o1' }],
    });
    renderScreen();
    const values = screen.getAllByTestId('stat-value').map((n) => n.textContent);
    expect(values).toContain('1'); // orgs
    expect(values).toContain('2'); // users
  });

  it('shows "—" placeholders while loading', () => {
    setupMocks({ loading: true });
    renderScreen();
    const values = screen.getAllByTestId('stat-value').map((n) => n.textContent);
    expect(values.filter((v) => v === '—').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the empty-orgs card', () => {
    setupMocks({
      orgs: [
        { id: 'o1', name: 'Org 1', createdAt: '2024-01-01' },
        { id: 'o2', name: 'Org 2', createdAt: '2024-01-01' },
      ],
      users: [{ id: 'u1', companyId: 'o1' }],
    });
    renderScreen();
    expect(screen.getByTestId('empty-orgs-card')).toBeInTheDocument();
  });

  it('renders the largest-org name', () => {
    setupMocks({
      orgs: [
        { id: 'o1', name: 'Big Org', createdAt: '2024-01-01' },
        { id: 'o2', name: 'Small Org', createdAt: '2024-01-01' },
      ],
      users: [
        { id: 'u1', companyId: 'o1' },
        { id: 'u2', companyId: 'o1' },
        { id: 'u3', companyId: 'o2' },
      ],
    });
    renderScreen();
    expect(screen.getByTestId('largest-org-name')).toHaveTextContent('Big Org');
  });

  it('shows em dash when there is no largest org', () => {
    renderScreen();
    expect(screen.getByTestId('largest-org-name')).toHaveTextContent('—');
  });

  it('renders global-charts when there is at least one org', () => {
    setupMocks({
      orgs: [{ id: 'o1', name: 'Org 1', createdAt: '2024-01-01' }],
    });
    renderScreen();
    expect(screen.getByTestId('global-charts')).toBeInTheDocument();
  });

  it('does not render global-charts when there are no orgs', () => {
    renderScreen();
    expect(screen.queryByTestId('global-charts')).not.toBeInTheDocument();
  });

  it('renders organisation rows with their name', () => {
    setupMocks({
      orgs: [{ id: 'o1', name: 'Acme Inc', createdAt: '2024-01-15T00:00:00Z' }],
    });
    renderScreen();
    // Org name appears in the row + the largest-org card; just assert presence.
    expect(screen.getAllByText('Acme Inc').length).toBeGreaterThanOrEqual(1);
  });

  it('filters organisations by the search input', () => {
    setupMocks({
      orgs: [
        { id: 'o1', name: 'Acme', createdAt: '2024-01-15T00:00:00Z' },
        { id: 'o2', name: 'Globex', createdAt: '2024-01-15T00:00:00Z' },
      ],
    });
    const { container } = renderScreen();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'glob' } });
    // Row paragraph is <p class="font-sans-semibold ..."> with the org name.
    const rowNames = Array.from(container.querySelectorAll('p.font-sans-semibold'))
      .map((n) => n.textContent);
    expect(rowNames).toContain('Globex');
    expect(rowNames).not.toContain('Acme');
  });

  it('shows the no-results message when search has no matches', () => {
    setupMocks({
      orgs: [{ id: 'o1', name: 'Acme', createdAt: '2024-01-15T00:00:00Z' }],
    });
    renderScreen();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'xyz' } });
    expect(screen.getByText('dashboard.orgNoResults')).toBeInTheDocument();
  });

  it('shows the no-orgs message when there are no organisations', () => {
    renderScreen();
    expect(screen.getByText('dashboard.orgNone')).toBeInTheDocument();
  });

  it('calls setActiveCompanyId when the "view" button on an org is clicked', () => {
    setupMocks({
      orgs: [{ id: 'org-42', name: 'Test Org', createdAt: '2024-01-15T00:00:00Z' }],
    });
    renderScreen();
    fireEvent.click(screen.getByText('common.view'));
    expect(setActiveCompanyId).toHaveBeenCalledWith('org-42');
  });

  it('navigates to /organizations when "Ver todos" is clicked', () => {
    const navigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigate);
    renderScreen();
    fireEvent.click(screen.getByText('common.viewAll'));
    expect(navigate).toHaveBeenCalledWith('/organizations');
  });

  it('navigates to organisation detail when the org name button is clicked', () => {
    const navigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigate);
    setupMocks({
      orgs: [{ id: 'o-detail', name: 'Detail Org', createdAt: '2024-01-15T00:00:00Z' }],
    });
    const { container } = renderScreen();
    // The clickable row is the button whose first child is the org name <p>.
    const rowButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.querySelector('p.font-sans-semibold')?.textContent === 'Detail Org',
    )!;
    fireEvent.click(rowButton);
    expect(navigate).toHaveBeenCalledWith('/organizations/o-detail');
  });
});
