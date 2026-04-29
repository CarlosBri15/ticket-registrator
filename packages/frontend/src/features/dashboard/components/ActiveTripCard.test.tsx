import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { enUS } from 'date-fns/locale';

vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="cal-icon" />,
  FileText: () => <span data-testid="file-icon" />,
}));

import { ActiveTripCard } from './ActiveTripCard';
import type { IReport } from '@ticket-registrator/shared';

const buildTrip = (overrides: Partial<IReport> = {}): IReport =>
  ({
    id: 'r1',
    name: 'Trip to Madrid',
    start_date: '2024-01-15T00:00:00Z',
    end_date: '2024-01-20T00:00:00Z',
    requested_amount: 1234,
    currency: 'EUR',
    status: 'CREATED',
    ...overrides,
  } as unknown as IReport);

const renderCard = (overrides: Partial<React.ComponentProps<typeof ActiveTripCard>> = {}) => {
  const props = {
    currentTrip: buildTrip(),
    navigate: vi.fn(),
    dateLocale: enUS,
    t: ((key: string, fallback?: string) => fallback ?? key) as any,
    ...overrides,
  };
  return { props, ...render(<ActiveTripCard {...props} />) };
};

describe('ActiveTripCard', () => {
  it('renders the trip name', () => {
    renderCard();
    expect(screen.getByText('Trip to Madrid')).toBeInTheDocument();
  });

  it('renders the in-progress badge', () => {
    renderCard();
    expect(screen.getByText('En curso')).toBeInTheDocument();
  });

  it('renders the formatted date range', () => {
    renderCard();
    expect(screen.getByText(/15 Jan.*–.*20 Jan/)).toBeInTheDocument();
  });

  it('renders the requested amount and currency', () => {
    renderCard();
    expect(screen.getByText(/1,234|1234/)).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('renders 0 when requested_amount is missing', () => {
    renderCard({ currentTrip: buildTrip({ requested_amount: null as any }) });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders the calendar and file icons', () => {
    renderCard();
    expect(screen.getByTestId('cal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });

  it('calls navigate with /reports/:id when the card is clicked', () => {
    const navigate = vi.fn();
    renderCard({ navigate });
    fireEvent.click(screen.getByText('Trip to Madrid'));
    expect(navigate).toHaveBeenCalledWith('/reports/r1');
  });
});
