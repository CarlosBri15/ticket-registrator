import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { es } from 'date-fns/locale';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useTicketsQuery: vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
  ArrowUpRight: () => <svg data-testid="icon-arrow-up-right" />,
  Calendar: () => <svg data-testid="icon-calendar" />,
  Receipt: () => <svg data-testid="icon-receipt" />,
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useTicketsQuery } from '@ticket-registrator/shared';
import { ActiveTripCard } from './ActiveTripCard';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {
  (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [
      { id: 'tk-1', amount: 100.5 },
      { id: 'tk-2', amount: 50.25 },
    ],
  });
};

const mockTrip = {
  id: 'trip-abc12345',
  name: 'Business Trip to Madrid',
  status: 'SUBMITTED',
  start_date: '2026-03-01T00:00:00.000Z',
  end_date: '2026-03-10T00:00:00.000Z',
  requested_amount: 500,
  currency: 'EUR',
};

const t = (key: string) => key;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ActiveTripCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  const renderCard = (navigateFn = vi.fn()) =>
    render(
      <MemoryRouter>
        <ActiveTripCard
          currentTrip={mockTrip as any}
          navigate={navigateFn}
          dateLocale={es}
          t={t}
        />
      </MemoryRouter>,
    );

  it('renders trip name', () => {
    renderCard();
    expect(screen.getByText('Business Trip to Madrid')).toBeInTheDocument();
  });

  it('renders trip dates', () => {
    renderCard();
    // The dates are formatted using date-fns. We check the component is rendered.
    // With es locale, 01 mar → "01 mar" and end "10 mar 2026"
    expect(screen.getByText(/mar/i)).toBeInTheDocument();
  });

  it('shows ticket count', () => {
    renderCard();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows total amount from tickets when tickets exist', () => {
    renderCard();
    // 100.5 + 50.25 = 150.75
    expect(screen.getByText('150.75')).toBeInTheDocument();
  });

  it('shows requested_amount when no tickets', () => {
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
    });
    renderCard();
    // totalAmount is 0, so shows requested_amount: 500
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('calls navigate when card is clicked', () => {
    const navigate = vi.fn();
    renderCard(navigate);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledWith('/reports/trip-abc12345');
  });
});
