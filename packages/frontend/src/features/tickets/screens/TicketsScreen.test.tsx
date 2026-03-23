import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AllTicketsScreen } from './TicketsScreen';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useReportsQuery: vi.fn(),
    useTicketsQuery: vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
  FileText: () => null,
  Receipt: () => null,
  ArrowRight: () => null,
  Calendar: () => null,
  Search: () => null,
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('../components/TicketDetailModal', () => ({
  TicketDetailModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">ticket-detail</div> : null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

import { useReportsQuery, useTicketsQuery } from '@ticket-registrator/shared';

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
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

  it('renders Todos los Tickets heading', () => {
    renderScreen();
    expect(screen.getByText('Todos los Tickets')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderScreen();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    renderScreen();
    expect(screen.getByText(/no hay tickets registrados/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText(/cargando tickets/i)).toBeInTheDocument();
  });

  it('renders ticket rows when report has tickets', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{
        id: 't1', location_name: 'Restaurante El Sol', amount: 25, currency: 'EUR',
        status: 'PENDING', date: '2024-01-10', expense_type: 'Comida',
      }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Restaurante El Sol')).toBeInTheDocument();
  });

  it('renders report group label with link', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{
        id: 't1', location_name: 'Tienda ABC', amount: 10, currency: 'EUR',
        status: 'PENDING', date: '2024-01-10', expense_type: 'Otro',
      }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('shows loading spinner in ReportTicketGroup when tickets are loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('opens ticket detail modal when a ticket is clicked', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('Restaurante Sol'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters tickets when search matches location name', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10', expense_type: 'Comida' },
        { id: 't2', location_name: 'Hotel Central', amount: 120, currency: 'EUR', status: 'APPROVED', date: '2024-01-11', expense_type: 'Alojamiento' },
      ],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'Sol' } });
    expect(screen.getByText('Restaurante Sol')).toBeInTheDocument();
    expect(screen.queryByText('Hotel Central')).not.toBeInTheDocument();
  });

  it('hides ticket group when search matches nothing', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10', expense_type: 'Comida' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'xyz-no-match' } });
    expect(screen.queryByText('Restaurante Sol')).not.toBeInTheDocument();
  });

  it('renders ticket without date as "---"', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: 'Ticket sin fecha', amount: 10, currency: 'EUR', status: 'PENDING', date: null }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('---')).toBeInTheDocument();
  });

  it('renders ticket without location_name as "Ticket"', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Viaje Madrid', status: 'CREATED', start_date: '2024-01-01', end_date: '2024-01-05' }],
      isLoading: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: null, amount: 10, currency: 'EUR', status: 'PENDING', date: '2024-01-10' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Ticket')).toBeInTheDocument();
  });
});
