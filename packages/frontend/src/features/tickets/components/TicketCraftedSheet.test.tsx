import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../../components/ui/LazyCharts', () => ({
  DonutChart: ({ data, centerValue }: any) => (
    <div data-testid="donut-chart" data-segments={data.length} data-center={centerValue} />
  ),
}));

vi.mock('../../../components/ui/ChartSkeleton', () => ({
  ChartSkeleton: () => <div data-testid="chart-skeleton" />,
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('./ItemsSection', () => ({
  ItemsSection: ({ variant }: any) => (
    <div data-testid="items-section" data-variant={variant} />
  ),
}));

import { TicketCraftedSheet } from './TicketCraftedSheet';
import type { ITicket } from '@ticket-registrator/shared';

const baseTicket = (overrides: Partial<ITicket> = {}): ITicket =>
  ({
    id: 't1234567890',
    amount: 42,
    currency: 'EUR',
    date: '2024-05-01',
    status: 'PENDING',
    location_name: 'Café Comercial',
    location_address: 'Glorieta de Bilbao, 7',
    payment_type: 'CARD',
    items: [
      { id: 'i1', name: 'Latte', amount: 4, currency: 'EUR', status: 'Pending', categoryId: 'c1', categoryName: 'Food', categoryColor: '#facc15' },
      { id: 'i2', name: 'Sandwich', amount: 38, currency: 'EUR', status: 'Pending', categoryId: 'c1', categoryName: 'Food', categoryColor: '#facc15' },
    ],
    ...overrides,
  } as ITicket);

const baseProps = {
  formattedDate: '1 May 2024',
  formattedCreatedAt: '1 May 2024 · 10:00',
  paymentValue: 'Card •••• 1234',
  canApprove: false,
  isImageOpen: false,
  onToggleImage: vi.fn(),
  onClose: vi.fn(),
  getItemStatus: () => 'Pending',
  onApprove: vi.fn(),
  onReject: vi.fn(),
  isSavingItems: false,
};

describe('TicketCraftedSheet', () => {
  it('renders merchant title and address', () => {
    render(<TicketCraftedSheet ticket={baseTicket()} {...baseProps} />);
    expect(screen.getByRole('heading', { name: 'Café Comercial' })).toBeInTheDocument();
    expect(screen.getAllByText('Glorieta de Bilbao, 7').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the donut chart when items have categorised amounts', () => {
    render(<TicketCraftedSheet ticket={baseTicket()} {...baseProps} />);
    const chart = screen.getByTestId('donut-chart');
    expect(chart).toBeInTheDocument();
    expect(chart.getAttribute('data-center')).toBe('42');
  });

  it('falls back to a numeric total when no chart can be drawn', () => {
    render(
      <TicketCraftedSheet
        ticket={baseTicket({ items: [] })}
        {...baseProps}
      />,
    );
    expect(screen.queryByTestId('donut-chart')).not.toBeInTheDocument();
    // "42" appears both in header fallback total and meta field — both expected.
    const totals = screen.getAllByText('42');
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('passes the ledger variant to ItemsSection', () => {
    render(<TicketCraftedSheet ticket={baseTicket()} {...baseProps} />);
    expect(screen.getByTestId('items-section').getAttribute('data-variant')).toBe('ledger');
  });

  it('fires onToggleImage when the receipt button is clicked', () => {
    const onToggleImage = vi.fn();
    render(
      <TicketCraftedSheet
        ticket={baseTicket()}
        {...baseProps}
        onToggleImage={onToggleImage}
      />,
    );
    fireEvent.click(screen.getByText('ticketDetail.imageTitle').closest('button')!);
    expect(onToggleImage).toHaveBeenCalled();
  });

  it('reflects the open state with aria-expanded on the image toggle', () => {
    render(
      <TicketCraftedSheet ticket={baseTicket()} {...baseProps} isImageOpen />,
    );
    const toggle = screen.getByText('ticketDetail.imageTitle').closest('button')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('data-open')).toBe('true');
  });

  it('renders the eyebrow only when expense_type is set', () => {
    const { rerender } = render(
      <TicketCraftedSheet
        ticket={baseTicket({ expense_type: 'Meals' } as any)}
        {...baseProps}
      />,
    );
    expect(screen.getByText('Meals')).toBeInTheDocument();

    rerender(
      <TicketCraftedSheet
        ticket={baseTicket({ expense_type: undefined } as any)}
        {...baseProps}
      />,
    );
    expect(screen.queryByText('Meals')).not.toBeInTheDocument();
  });

  it('renders the edit button only when isEditable + onEdit are provided', () => {
    const onEdit = vi.fn();
    const { rerender } = render(
      <TicketCraftedSheet
        ticket={baseTicket()}
        {...baseProps}
        isEditable
        onEdit={onEdit}
      />,
    );
    fireEvent.click(screen.getByLabelText('common.edit'));
    expect(onEdit).toHaveBeenCalled();

    rerender(
      <TicketCraftedSheet ticket={baseTicket()} {...baseProps} />,
    );
    expect(screen.queryByLabelText('common.edit')).not.toBeInTheDocument();
  });
});
