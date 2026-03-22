import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ReportsScreen } from './ReportsScreen';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Plus: () => null,
  Calendar: () => null,
  ArrowUpRight: () => null,
  Clock: () => null,
  CheckCircle: () => null,
  FileText: () => null,
  Wallet: () => null,
  ChevronRight: () => null,
  BarChart3: () => null,
  MapPin: () => null,
  Search: () => <span>Search</span>,
  X: () => <span>X</span>,
  Filter: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('./components/ReportForm', () => ({
  ReportForm: () => <div>report-form</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

import { useReportsQuery } from '@ticket-registrator/shared';

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
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
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Viajes heading', () => {
    renderScreen();
    expect(screen.getByText('trips.title')).toBeInTheDocument();
  });

  it('renders new report button', () => {
    renderScreen();
    expect(screen.getByText('trips.newTripTitle')).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    renderScreen();
    expect(screen.getByText('trips.noTickets')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders report card when reports exist', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        approved_amount: null, destination: 'Madrid',
      }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('opens create report modal when new trip button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getAllByText('trips.newTripTitle')[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders filter bar when reports exist', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null }],
      isLoading: false,
    });
    renderScreen();
    // Search input appears with the t() key as placeholder
    expect(screen.getByPlaceholderText('trips.filterSearch')).toBeInTheDocument();
  });

  it('shows no results message when search filter produces empty results', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null, currency: 'EUR', requested_amount: 100 }],
      isLoading: false,
    });
    renderScreen();
    const searchInput = screen.getByPlaceholderText('trips.filterSearch');
    fireEvent.change(searchInput, { target: { value: 'xyz-no-match' } });
    expect(screen.getAllByText('trips.noResultsFilter').length).toBeGreaterThanOrEqual(1);
  });

  it('renders completed trip in history section', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Viaje Aprobado', status: 'APPROVED', start_date: '2024-01-01', end_date: '2024-01-10', approved_amount: 500, currency: 'EUR', requested_amount: 500 },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje Aprobado')).toBeInTheDocument();
  });

  it('renders "view all" button when more than 4 completed trips', () => {
    const completedReports = Array.from({ length: 5 }, (_, i) => ({
      id: `r${i}`, name: `Viaje ${i}`, status: 'APPROVED',
      start_date: '2024-01-01', end_date: '2024-01-10',
      approved_amount: 100, currency: 'EUR', requested_amount: 100,
    }));
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: completedReports,
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('common.viewAll')).toBeInTheDocument();
  });

  it('shows clearFilters button and calls clearFilters when clicked', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null, currency: 'EUR', requested_amount: 100 }],
      isLoading: false,
    });
    renderScreen();
    const searchInput = screen.getByPlaceholderText('trips.filterSearch');
    fireEvent.change(searchInput, { target: { value: 'xyz-no-match' } });
    expect(screen.getAllByText('trips.noResultsFilter').length).toBeGreaterThanOrEqual(1);
    const clearBtn = screen.getAllByText('trips.filterClearAll')[0];
    fireEvent.click(clearBtn);
    expect(screen.queryByText('trips.filterClearAll')).not.toBeInTheDocument();
  });

  it('renders type badge on active trip card when report has type', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null, currency: 'EUR', requested_amount: 100, type: 'Business Trip' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Business Trip')).toBeInTheDocument();
  });

  it('navigates to report detail when card is clicked', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate as any).mockReturnValue(mockNavigate);

    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null, currency: 'EUR', requested_amount: 100 }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('Viaje Madrid').closest('button')!);
    expect(mockNavigate).toHaveBeenCalledWith('/reports/r1');
  });

  it('navigates to report detail when Scan Ticket button is clicked', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate as any).mockReturnValue(mockNavigate);

    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', approved_amount: null, currency: 'EUR', requested_amount: 100 }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('home.scanTicket'));
    expect(mockNavigate).toHaveBeenCalledWith('/reports/r1');
  });

  it('updates status filter when a status chip is clicked', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Created', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', currency: 'EUR' },
        { id: 'r2', name: 'Submitted', status: 'SUBMITTED', start_date: '2024-01-01', end_date: '2024-01-05', currency: 'EUR' }
      ],
      isLoading: false,
    });
    renderScreen();
    // Initially both should be visible (under "ALL")
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();

    // Click on SUBMITTED filter
    fireEvent.click(screen.getByText('status.SUBMITTED'));
    
    // Now only Submitted should be visible
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('clears search when X button is clicked', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', currency: 'EUR' }],
      isLoading: false,
    });
    renderScreen();
    const searchInput = screen.getByPlaceholderText('trips.filterSearch');
    fireEvent.change(searchInput, { target: { value: 'Madrid' } });
    
    // Find the clearing button by its aria-label
    const xButton = screen.getByLabelText('clear-search');
    fireEvent.click(xButton);
    
    expect(searchInput).toHaveValue('');
  });

  it('updates date range filters', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Early Jan', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05', currency: 'EUR' },
        { id: 'r2', name: 'Late Jan', status: 'CREATED', start_date: '2024-01-20', end_date: '2024-01-25', currency: 'EUR' }
      ],
      isLoading: false,
    });
    const { container } = renderScreen();
    
    const dateFromInput = container.querySelector('input[type="date"]:first-of-type') as HTMLInputElement;
    fireEvent.change(dateFromInput, { target: { value: '2024-01-15' } });

    expect(screen.queryByText('Early Jan')).not.toBeInTheDocument();
    expect(screen.getByText('Late Jan')).toBeInTheDocument();
  });
});
