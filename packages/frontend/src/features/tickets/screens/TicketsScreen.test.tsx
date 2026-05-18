import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AllTicketsScreen } from './TicketsScreen';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useReportsQuery: vi.fn(),
    api: {
      tickets: () => ({ getByReport: vi.fn().mockResolvedValue([]) }),
    },
  };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueries: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('../components/TicketDetailModal', () => ({
  TicketDetailModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">ticket-detail</div> : null,
}));

import { useReportsQuery } from '@ticket-registrator/shared';
import { useQueries } from '@tanstack/react-query';

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([]);
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <AllTicketsScreen />
    </MemoryRouter>,
  );

describe('AllTicketsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders the page title', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ticketsPage.title');
  });

  it('renders search input when there are reports', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{ data: [], isLoading: false }]);
    renderScreen();
    expect(screen.getByPlaceholderText('ticketsPage.searchPlaceholder')).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    renderScreen();
    expect(screen.getByText('ticketsPage.noTickets')).toBeInTheDocument();
  });

  it('shows loading spinner when reports are loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText('ticketsPage.loading')).toBeInTheDocument();
  });

  it('shows loading spinner when ticket queries are pending', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{ data: undefined, isLoading: true }]);
    const { container } = renderScreen();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders ticket rows when report has tickets', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{
        id: 't1', location_name: 'Restaurante El Sol', amount: 25, currency: 'EUR',
        status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z',
        items: [{ id: 'i1', categoryName: 'Comida', categoryId: 'cat1', status: 'Pending', amount: 25, currency: 'EUR', name: 'Item 1' }],
      }],
      isLoading: false,
    }]);
    renderScreen();
    expect(screen.getByText('Restaurante El Sol')).toBeInTheDocument();
  });

  it('renders the report name within the row', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{
        id: 't1', location_name: 'Tienda ABC', amount: 10, currency: 'EUR',
        status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [],
      }],
      isLoading: false,
    }]);
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('opens ticket detail modal when a ticket is clicked', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [] }],
      isLoading: false,
    }]);
    renderScreen();
    fireEvent.click(screen.getByText('Restaurante Sol'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters tickets when search matches location name', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [
        { id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [{ categoryName: 'Comida' }] },
        { id: 't2', location_name: 'Hotel Central', amount: 120, currency: 'EUR', status: 'Approved', date: '2024-01-11', createdAt: '2024-01-11T10:00:00Z', items: [{ categoryName: 'Alojamiento' }] },
      ],
      isLoading: false,
    }]);
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText('ticketsPage.searchPlaceholder'), { target: { value: 'Sol' } });
    expect(screen.getByText('Restaurante Sol')).toBeInTheDocument();
    expect(screen.queryByText('Hotel Central')).not.toBeInTheDocument();
  });

  it('shows no-results empty state when search matches nothing', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [{ categoryName: 'Comida' }] }],
      isLoading: false,
    }]);
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText('ticketsPage.searchPlaceholder'), { target: { value: 'xyz-no-match' } });
    expect(screen.queryByText('Restaurante Sol')).not.toBeInTheDocument();
    expect(screen.getByText('ticketsPage.noResults')).toBeInTheDocument();
  });

  it('renders ticket without amount with an em dash', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{ id: 't1', location_name: 'Ticket sin monto', amount: null, currency: 'EUR', status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [] }],
      isLoading: false,
    }]);
    renderScreen();
    // Multiple cells may render the em dash (amount + payment + dates) — assert at least one.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders fallback name when location_name is missing', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useQueries as ReturnType<typeof vi.fn>).mockReturnValue([{
      data: [{ id: 't1', location_name: null, amount: 10, currency: 'EUR', status: 'Pending', date: '2024-01-10', createdAt: '2024-01-10T10:00:00Z', items: [] }],
      isLoading: false,
    }]);
    renderScreen();
    expect(screen.getByText('reportDetail.noTicketName')).toBeInTheDocument();
  });
});
