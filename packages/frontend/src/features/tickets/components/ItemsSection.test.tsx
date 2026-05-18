import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

import { ItemsSection } from './ItemsSection';
import type { ITicket, IItem } from '@ticket-registrator/shared';

const buildTicket = (items: any[] = []): ITicket =>
  ({ id: 'tk1', items } as unknown as ITicket);

const baseProps = {
  canApprove: true,
  getItemStatus: (i: IItem) => (i as any).status ?? 'Pending',
  onApprove: vi.fn(),
  onReject: vi.fn(),
  isSaving: false,
};

describe('ItemsSection', () => {
  it('renders the empty state when there are no items', () => {
    render(<ItemsSection ticket={buildTicket([])} {...baseProps} />);
    expect(screen.getByText('reportDetail.noItems')).toBeInTheDocument();
  });

  it('renders an item with name and amount', () => {
    const ticket = buildTicket([
      { id: 'i1', name: 'Coffee', amount: 5.5, currency: 'EUR', status: 'Pending' },
    ]);
    render(<ItemsSection ticket={ticket} {...baseProps} />);
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText(/5.5/)).toBeInTheDocument();
    expect(screen.getByText('Eur')).toBeInTheDocument();
  });

  it('renders em dash when item amount is null', () => {
    const ticket = buildTicket([
      { id: 'i1', name: 'Item', amount: null, status: 'Pending' },
    ]);
    render(<ItemsSection ticket={ticket} {...baseProps} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the items count badge when there are items', () => {
    const ticket = buildTicket([
      { id: 'i1', name: 'a', amount: 7, status: 'Pending' },
      { id: 'i2', name: 'b', amount: 9, status: 'Pending' },
    ]);
    const { container } = render(<ItemsSection ticket={ticket} {...baseProps} />);
    const badge = container.querySelector('span.bg-dark\\/5');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('2');
  });

  it('fires onApprove when approve button is clicked', () => {
    const onApprove = vi.fn();
    const ticket = buildTicket([{ id: 'i1', name: 'Coffee', amount: 5, status: 'Pending' }]);
    render(<ItemsSection ticket={ticket} {...baseProps} onApprove={onApprove} />);
    fireEvent.click(screen.getByText(/Common\.approve/i));
    expect(onApprove).toHaveBeenCalledWith('i1');
  });

  it('fires onReject when reject button is clicked', () => {
    const onReject = vi.fn();
    const ticket = buildTicket([{ id: 'i1', name: 'Coffee', amount: 5, status: 'Pending' }]);
    render(<ItemsSection ticket={ticket} {...baseProps} onReject={onReject} />);
    fireEvent.click(screen.getByText(/Common\.reject/i));
    expect(onReject).toHaveBeenCalledWith('i1');
  });

  it('renders a StatusBadge instead of approve/reject buttons when canApprove=false', () => {
    const ticket = buildTicket([{ id: 'i1', name: 'Coffee', amount: 5, status: 'Approved' }]);
    render(
      <ItemsSection
        ticket={ticket}
        {...baseProps}
        canApprove={false}
        getItemStatus={() => 'Approved'}
      />,
    );
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Approved');
    expect(screen.queryByText(/Common\.approve/i)).not.toBeInTheDocument();
  });

  it('does not render a Save button — approve/reject persist immediately', () => {
    const ticket = buildTicket([{ id: 'i1', name: 'Coffee', amount: 5, status: 'Pending' }]);
    render(<ItemsSection ticket={ticket} {...baseProps} />);
    expect(screen.queryByText(/Common\.save/i)).not.toBeInTheDocument();
  });

  it('disables approve/reject buttons while a save is in flight', () => {
    const ticket = buildTicket([{ id: 'i1', name: 'Coffee', amount: 5, status: 'Pending' }]);
    render(<ItemsSection ticket={ticket} {...baseProps} isSaving />);
    const approve = screen.getByText(/Common\.approve/i).closest('button') as HTMLButtonElement;
    const reject = screen.getByText(/Common\.reject/i).closest('button') as HTMLButtonElement;
    expect(approve.disabled).toBe(true);
    expect(reject.disabled).toBe(true);
  });

  it('renders em dash when item has no name', () => {
    const ticket = buildTicket([{ id: 'i1', name: null, amount: 5, status: 'Pending' }]);
    render(<ItemsSection ticket={ticket} {...baseProps} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders a colored dot using the item categoryColor in ledger variant', () => {
    const ticket = buildTicket([
      { id: 'i1', name: 'Coffee', amount: 5, status: 'Pending', categoryColor: 'rgb(255, 0, 0)' },
    ]);
    const { container } = render(
      <ItemsSection ticket={ticket} {...baseProps} variant="ledger" />,
    );
    const dot = container.querySelector('.sheet-item-dot') as HTMLSpanElement | null;
    expect(dot).not.toBeNull();
    expect(dot!.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('renders the dotted leader span between name and amount in ledger variant', () => {
    const ticket = buildTicket([
      { id: 'i1', name: 'Coffee', amount: 5, status: 'Pending' },
    ]);
    const { container } = render(
      <ItemsSection ticket={ticket} {...baseProps} variant="ledger" />,
    );
    expect(container.querySelector('.sheet-item-leader')).not.toBeNull();
  });
});
