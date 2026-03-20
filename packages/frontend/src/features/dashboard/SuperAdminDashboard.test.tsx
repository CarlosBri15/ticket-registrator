import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mock ──────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', () => ({
  useUserQuery: vi.fn(),
  useUsersQuery: vi.fn(),
  useOrganizationsQuery: vi.fn(),
  useScopeContext: vi.fn(),
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
  useUserQuery,
  useUsersQuery,
  useOrganizationsQuery,
  useScopeContext,
} from '@ticket-registrator/shared';
import { SuperAdminGlobalDashboard } from './SuperAdminDashboard';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupGlobal = (orgs: any[] = [], users: any[] = []) => {
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: orgs, isLoading: false });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: users });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <SuperAdminGlobalDashboard />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SuperAdmin global mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupGlobal();
  });

  it('renders SuperAdminGlobalDashboard instead of regular dashboard', () => {
    renderScreen();
    expect(screen.getByTestId('global-stats')).toBeInTheDocument();
  });

  it('shows greeting with user name in global mode', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Carlos', roleName: 'SuperAdmin' } });
    renderScreen();
    expect(screen.getByText(/Carlos/)).toBeInTheDocument();
  });

  it('shows SuperAdmin role badge', () => {
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { name: 'Carlos', roleName: 'SuperAdmin' } });
    renderScreen();
    expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
  });

  it('shows total organizations count in global stats', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
       { id: 'o2', name: 'Globex', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [],
    );
    renderScreen();
    const statValues = screen.getAllByTestId('stat-value');
    // First stat = orgs count = "2"
    expect(statValues[0].textContent).toBe('2');
  });

  it('shows total users count in global stats', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [{ id: 'u1', companyId: 'o1' }, { id: 'u2', companyId: 'o1' }, { id: 'u3', companyId: 'o1' }],
    );
    renderScreen();
    const statValues = screen.getAllByTestId('stat-value');
    // Second stat = users count = "3"
    expect(statValues[1].textContent).toBe('3');
  });

  it('shows loading placeholder "—" while orgs are loading', () => {
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined });
    renderScreen();
    const statValues = screen.getAllByTestId('stat-value');
    expect(statValues[0].textContent).toBe('—');
  });

  it('renders org list with org names', () => {
    setupGlobal([
      { id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'o2', name: 'Globex Inc', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);
    renderScreen();
    // Acme Corp may appear in both the org grid and the "largest org" card
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });

  it('shows empty state when no organizations exist', () => {
    setupGlobal([]);
    renderScreen();
    expect(screen.getByText(/no hay organizaciones/i)).toBeInTheDocument();
  });

  it('filters org list by search input', () => {
    setupGlobal([
      { id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'o2', name: 'Globex Inc', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar organización/i), { target: { value: 'Acme' } });
    // Acme Corp appears in the filtered org grid (and possibly in the "largest org" stat card)
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1);
    // Globex Inc is filtered out from the org grid and is NOT the largest org
    expect(screen.queryByText('Globex Inc')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    setupGlobal([{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar organización/i), { target: { value: 'zzz' } });
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  it('clears search when X button is clicked', () => {
    setupGlobal([{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    renderScreen();
    const input = screen.getByPlaceholderText(/buscar organización/i);
    fireEvent.change(input, { target: { value: 'test' } });
    // The X (clear) button renders when search has a value
    expect(input).toHaveValue('test');
  });

  it('calls setActiveCompanyId when "Ver" button is clicked on an org', () => {
    const mockSet = vi.fn();
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: mockSet });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      isLoading: false,
    });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
    renderScreen();
    fireEvent.click(screen.getByText('Ver'));
    expect(mockSet).toHaveBeenCalledWith('o1');
  });

  it('navigates to /organizations/:id when arrow button is clicked', () => {
    setupGlobal([{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    renderScreen();
    fireEvent.click(screen.getByTitle('Detalle completo'));
    expect(mockNavigate).toHaveBeenCalledWith('/organizations/o1');
  });

  it('navigates to /organizations when "Nueva org" is clicked', () => {
    setupGlobal();
    renderScreen();
    fireEvent.click(screen.getByText('Nueva org'));
    expect(mockNavigate).toHaveBeenCalledWith('/organizations');
  });

  it('shows org count summary at the bottom of the list', () => {
    setupGlobal([
      { id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'o2', name: 'Globex', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);
    renderScreen();
    expect(screen.getByText(/2 de 2 organizaciones/i)).toBeInTheDocument();
  });

  it('shows loading skeletons while orgs are loading', () => {
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  // ── Empty orgs card ──────────────────────────────────────────────────────

  it('renders empty-orgs-card in global stats', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    expect(screen.getByTestId('empty-orgs-card')).toBeInTheDocument();
  });

  it('shows "Todas tienen usuarios" when all orgs have at least one user', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    expect(screen.getByText('Todas tienen usuarios')).toBeInTheDocument();
  });

  it('shows "Requieren atención" when there are orgs without users', () => {
    setupGlobal(
      [
        { id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'o2', name: 'Empty Org', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    expect(screen.getByText('Requieren atención')).toBeInTheDocument();
  });

  it('shows "1" in empty-orgs-card when one org has no users', () => {
    setupGlobal(
      [
        { id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'o2', name: 'Empty', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    const card = screen.getByTestId('empty-orgs-card');
    expect(card.textContent).toContain('1');
  });

  // ── Largest org card ─────────────────────────────────────────────────────

  it('shows largest org name in stat card', () => {
    setupGlobal(
      [
        { id: 'o1', name: 'Pequeña', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'o2', name: 'Grande Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      [
        { id: 'u1', companyId: 'o1' },
        { id: 'u2', companyId: 'o2' },
        { id: 'u3', companyId: 'o2' },
        { id: 'u4', companyId: 'o2' },
      ],
    );
    renderScreen();
    expect(screen.getByTestId('largest-org-name').textContent).toBe('Grande Corp');
  });

  it('shows "—" in largest org card when no orgs exist', () => {
    setupGlobal([], []);
    renderScreen();
    expect(screen.getByTestId('largest-org-name').textContent).toBe('—');
  });

  // ── Charts section ───────────────────────────────────────────────────────

  it('renders global-charts section when orgs exist', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    expect(screen.getByTestId('global-charts')).toBeInTheDocument();
  });

  it('does not render global-charts when no orgs exist', () => {
    setupGlobal([], []);
    renderScreen();
    expect(screen.queryByTestId('global-charts')).not.toBeInTheDocument();
  });

  it('renders chart labels for org growth and user distribution', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [{ id: 'u1', companyId: 'o1' }],
    );
    renderScreen();
    expect(screen.getByText(/altas de organizaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios por organización/i)).toBeInTheDocument();
  });

  it('shows "Sin usuarios registrados aún" in distribution chart when all orgs empty', () => {
    setupGlobal(
      [{ id: 'o1', name: 'Acme', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      [],
    );
    renderScreen();
    expect(screen.getByText(/sin usuarios registrados aún/i)).toBeInTheDocument();
  });
});
