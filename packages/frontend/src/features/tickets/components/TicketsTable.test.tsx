import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('../../../components/ui/TableHeader', () => ({
  TableHeader: ({ columns }: any) => (
    <div data-testid="table-header">{columns.map((c: any) => c.label).join('|')}</div>
  ),
}));

vi.mock('../../../hooks/useDateLocale', () => ({
  useDateLocale: () => undefined,
}));

import { TicketsTable } from './TicketsTable';
import type { ITicket } from '@ticket-registrator/shared';

const buildTicket = (overrides: Partial<ITicket> = {}): ITicket =>
  ({
    id: 'tk1',
    location_name: 'Sol',
    payment_type: 'CASH',
    amount: 25.5,
    currency: 'EUR',
    items: [{}, {}],
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-20T00:00:00.000Z',
    ...overrides,
  } as unknown as ITicket);

describe('TicketsTable', () => {
  it('renders the loading skeleton when isLoading is true', () => {
    const { container } = render(<TicketsTable tickets={[]} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders the empty state when tickets is empty', () => {
    render(<TicketsTable tickets={[]} />);
    expect(screen.getByText('reportDetail.startDigitalizing')).toBeInTheDocument();
  });

  it('renders the table header columns when there are tickets', () => {
    render(<TicketsTable tickets={[buildTicket()]} />);
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('renders ticket location name and items count', () => {
    render(<TicketsTable tickets={[buildTicket({ location_name: 'Hotel Madrid', items: [{}] as any })]} />);
    expect(screen.getByText('Hotel Madrid')).toBeInTheDocument();
    expect(screen.getByText('1 reportDetail.items')).toBeInTheDocument();
  });

  it('renders fallback location name when missing', () => {
    render(<TicketsTable tickets={[buildTicket({ location_name: undefined as any })]} />);
    expect(screen.getByText('reportDetail.noTicketName')).toBeInTheDocument();
  });

  it('renders the payment type label when present', () => {
    render(<TicketsTable tickets={[buildTicket({ payment_type: 'Tarjeta' })]} />);
    expect(screen.getByText('Tarjeta')).toBeInTheDocument();
  });

  it('renders em dashes when payment_type, amount, dates are missing', () => {
    render(
      <TicketsTable
        tickets={[
          buildTicket({
            payment_type: null as any,
            amount: null as any,
            date: null as any,
            createdAt: null as any,
          }),
        ]}
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('fires onTicketClick with the ticket when a row is clicked', () => {
    const onTicketClick = vi.fn();
    const ticket = buildTicket({ id: 'tk-99', location_name: 'Cafe' });
    render(<TicketsTable tickets={[ticket]} onTicketClick={onTicketClick} />);
    fireEvent.click(screen.getByText('Cafe'));
    expect(onTicketClick).toHaveBeenCalledWith(ticket);
  });

  it('sorts tickets descending by createdAt', () => {
    const tickets = [
      buildTicket({ id: 'a', location_name: 'Old', createdAt: '2024-01-01T00:00:00.000Z' }),
      buildTicket({ id: 'b', location_name: 'New', createdAt: '2024-03-01T00:00:00.000Z' }),
      buildTicket({ id: 'c', location_name: 'Mid', createdAt: '2024-02-01T00:00:00.000Z' }),
    ];
    const { container } = render(<TicketsTable tickets={tickets} />);
    const names = Array.from(container.querySelectorAll('button')).map(
      (b) => b.querySelector('p')?.textContent,
    );
    expect(names).toEqual(['New', 'Mid', 'Old']);
  });

  it('renders amount with currency', () => {
    render(<TicketsTable tickets={[buildTicket({ amount: 1234.56, currency: 'USD' })]} />);
    expect(screen.getByText(/1,234.56|1234.56/)).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});
