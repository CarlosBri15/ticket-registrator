import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

import { PhysicalReceiptCard } from './PhysicalReceiptCard';

const buildTicket = (overrides: any = {}) => ({
  id: 'ticket-uuid-1234',
  amount: 99.5,
  currency: 'EUR',
  location_name: 'Cafe Sol',
  location_address: 'Calle Mayor 1',
  status: 'Pending',
  expense_type: 'Food',
  ...overrides,
});

describe('PhysicalReceiptCard', () => {
  it('renders amount and currency', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket()}
        formattedDate="15 Jan 2024"
        formattedCreatedAt="20 Jan 2024"
        paymentValue="Card"
      />,
    );
    expect(screen.getByText(/99[.,]5/)).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('renders em dash for null amount', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket({ amount: null })}
        formattedDate=""
        formattedCreatedAt=""
        paymentValue=""
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders formatted date and merchant', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket()}
        formattedDate="15 Jan 2024"
        formattedCreatedAt="20 Jan 2024"
        paymentValue="Card"
      />,
    );
    expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Cafe Sol')).toBeInTheDocument();
    expect(screen.getByText('Calle Mayor 1')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
  });

  it('renders the StatusBadge with the ticket status', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket()}
        formattedDate=""
        formattedCreatedAt=""
        paymentValue=""
      />,
    );
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Pending');
  });

  it('renders the expense_type tag when set', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket()}
        formattedDate=""
        formattedCreatedAt=""
        paymentValue=""
      />,
    );
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('does not render expense_type tag when missing', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket({ expense_type: null })}
        formattedDate=""
        formattedCreatedAt=""
        paymentValue=""
      />,
    );
    expect(screen.queryByText('Food')).not.toBeInTheDocument();
  });

  it('renders the truncated id (first 8 chars)', () => {
    render(
      <PhysicalReceiptCard
        ticket={buildTicket()}
        formattedDate=""
        formattedCreatedAt=""
        paymentValue=""
      />,
    );
    expect(screen.getByText(/ticket-u/)).toBeInTheDocument();
  });
});
