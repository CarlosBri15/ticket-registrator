import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AllTicketsScreen } from './TicketsScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
  useTicketsQuery: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  FileText: () => null,
  Receipt: () => null,
  ArrowRight: () => null,
  Calendar: () => null,
  Search: () => null,
}));

vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('./components/TicketDetailModal', () => ({
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
});
