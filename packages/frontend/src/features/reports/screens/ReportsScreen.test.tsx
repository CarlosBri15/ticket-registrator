import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'es' } }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useReportsQuery: vi.fn(),
    useReportsPaginatedQuery: vi.fn(),
    useReportFilterState: vi.fn(),
    useScope: vi.fn(),
  };
});

vi.mock('../components/ReportForm', () => ({
  ReportForm: ({ onCancel }: any) => (
    <div data-testid="report-form">
      <button onClick={onCancel}>cancel</button>
    </div>
  ),
}));

vi.mock('../components/ReportCard', () => ({
  ReportCard: ({ report, onClick }: any) => (
    <button data-testid="active-card" onClick={onClick}>
      {report.name}
    </button>
  ),
}));

vi.mock('../components/ReportRow', () => ({
  ReportRowItem: ({ report, onClick }: any) => (
    <button data-testid="row" onClick={onClick}>
      {report.name}
    </button>
  ),
}));

vi.mock('../components/ReportFilterBar', () => ({
  ReportFilterBar: ({ search, onSearch, hasFilters, onClear }: any) => (
    <div data-testid="filter-bar">
      <input
        data-testid="filter-search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      {hasFilters && (
        <button data-testid="clear-filters" onClick={onClear}>
          clear
        </button>
      )}
    </div>
  ),
}));

vi.mock('../components/ReportSkeletonCard', () => ({
  ReportSkeletonCard: () => <div data-testid="skeleton" />,
}));

vi.mock('../../../components/ui/EmptyState', () => ({
  EmptyState: ({ title, action }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      {action}
    </div>
  ),
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../../components/ui/Pagination', () => ({
  Pagination: ({ page, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span data-testid="page">{page}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button data-testid="page-2" onClick={() => onPageChange(2)}>2</button>
    </div>
  ),
}));

vi.mock('../../../components/ui/TableHeader', () => ({
  TableHeader: () => <div data-testid="table-header" />,
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../../../hooks/useDateLocale', () => ({
  useDateLocale: () => undefined,
}));

import {
  useReportsQuery,
  useReportsPaginatedQuery,
  useReportFilterState,
  useScope,
} from '@ticket-registrator/shared';
import { ReportsScreen } from './ReportsScreen';

const futureToday = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const buildReport = (overrides: any = {}) => ({
  id: 'r1',
  name: 'Report A',
  status: 'CREATED',
  start_date: '2020-01-01',
  end_date: '2020-01-31',
  requested_amount: 100,
  approved_amount: null,
  currency: 'EUR',
  ...overrides,
});

const mockFilterState = (overrides: any = {}) => ({
  search: '',
  setSearch: vi.fn(),
  statusFilter: 'ALL',
  setStatusFilter: vi.fn(),
  dateRange: null,
  setDateRange: vi.fn(),
  hasActiveFilters: false,
  clearFilters: vi.fn(),
  ...overrides,
});

const setupMocks = (opts: {
  reports?: any[];
  paginated?: { data: any[]; total: number; totalPages: number };
  loadingCurrent?: boolean;
  loadingList?: boolean;
  filter?: any;
} = {}) => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: opts.reports ?? [],
    isLoading: opts.loadingCurrent ?? false,
  });
  (useReportsPaginatedQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: opts.paginated ?? { data: [], total: 0, totalPages: 1 },
    isLoading: opts.loadingList ?? false,
  });
  (useReportFilterState as ReturnType<typeof vi.fn>).mockReturnValue(mockFilterState(opts.filter));
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <ReportsScreen />
    </MemoryRouter>,
  );

describe('ReportsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    setupMocks();
  });

  it('renders the title and the new-report button', () => {
    renderScreen();
    expect(screen.getByText('trips.title')).toBeInTheDocument();
    expect(screen.getByText('trips.new')).toBeInTheDocument();
  });

  it('shows the empty state when there are no reports', () => {
    renderScreen();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('trips.noTickets')).toBeInTheDocument();
  });

  it('does not render the empty state while loading', () => {
    setupMocks({ loadingList: true });
    renderScreen();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('opens the new-report modal when clicking the new-report button', () => {
    renderScreen();
    fireEvent.click(screen.getByText('trips.new'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('report-form')).toBeInTheDocument();
  });

  it('closes the modal when ReportForm fires onCancel', () => {
    renderScreen();
    fireEvent.click(screen.getByText('trips.new'));
    fireEvent.click(screen.getByText('cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the active report card when there is a current report', () => {
    const active = buildReport({
      id: 'active-1',
      name: 'Active Trip',
      start_date: futureToday(-1),
      end_date: futureToday(1),
    });
    setupMocks({
      reports: [active],
      paginated: { data: [active], total: 1, totalPages: 1 },
    });
    renderScreen();
    expect(screen.getByTestId('active-card')).toBeInTheDocument();
    expect(screen.getByText('Active Trip')).toBeInTheDocument();
  });

  it('navigates to the active report detail when the active card is clicked', () => {
    const navigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigate);
    const active = buildReport({
      id: 'r-active',
      name: 'Trip',
      start_date: futureToday(-1),
      end_date: futureToday(1),
    });
    setupMocks({
      reports: [active],
      paginated: { data: [], total: 0, totalPages: 1 },
    });
    renderScreen();
    fireEvent.click(screen.getByTestId('active-card'));
    expect(navigate).toHaveBeenCalledWith('/reports/r-active');
  });

  it('renders the filter bar and table header when reports exist', () => {
    const r = buildReport();
    setupMocks({
      reports: [r],
      paginated: { data: [r], total: 1, totalPages: 1 },
    });
    renderScreen();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('renders one ReportRowItem per paginated report', () => {
    const r1 = buildReport({ id: 'r1', name: 'One' });
    const r2 = buildReport({ id: 'r2', name: 'Two' });
    setupMocks({
      reports: [r1, r2],
      paginated: { data: [r1, r2], total: 2, totalPages: 1 },
    });
    renderScreen();
    expect(screen.getAllByTestId('row')).toHaveLength(2);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('navigates to the report detail when a row is clicked', () => {
    const navigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigate);
    const r = buildReport({ id: 'rx', name: 'X' });
    setupMocks({
      reports: [r],
      paginated: { data: [r], total: 1, totalPages: 1 },
    });
    renderScreen();
    fireEvent.click(screen.getByTestId('row'));
    expect(navigate).toHaveBeenCalledWith('/reports/rx');
  });

  it('renders the no-results filter message when active filters yield 0 rows', () => {
    setupMocks({
      reports: [buildReport()],
      paginated: { data: [], total: 0, totalPages: 0 },
      filter: { hasActiveFilters: true },
    });
    renderScreen();
    expect(screen.getByText('trips.noResultsFilter')).toBeInTheDocument();
  });

  it('renders pagination when there are paginated rows', () => {
    const r1 = buildReport();
    setupMocks({
      reports: [r1],
      paginated: { data: [r1], total: 6, totalPages: 2 },
    });
    renderScreen();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('total-pages').textContent).toBe('2');
  });
});
