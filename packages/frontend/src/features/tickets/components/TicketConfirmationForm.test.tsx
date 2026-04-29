import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketConfirmationForm } from './TicketConfirmationForm';

vi.mock('lucide-react', () => ({
  Check: () => null,
  AlertCircle: () => null,
  Cpu: () => null,
  Home: () => null,
  MapPin: () => null,
  Calendar: () => null,
  DollarSign: () => null,
  CreditCard: () => null,
  Tag: () => null,
  List: () => null,
}));

vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));
vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

const mockTicket = {
  id: 't1', location_name: 'Restaurante El Sol', amount: 25, currency: 'EUR',
  status: 'Pending', date: '2024-01-10',
  location_address: 'Calle Mayor 1', payment_type: 'Tarjeta',
  items: [
    { id: 'i1', name: 'Consulta', categoryId: 'cat1', categoryName: 'Comida', amount: 25, currency: 'EUR', status: 'Pending' }
  ],
};

describe('TicketConfirmationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TicketConfirmationForm
        ticket={mockTicket as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('renders AI extraction banner', () => {
    render(
      <TicketConfirmationForm
        ticket={mockTicket as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getAllByText(/IA extrajo/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders confirm button', () => {
    render(
      <TicketConfirmationForm
        ticket={mockTicket as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Confirmar Ticket')).toBeInTheDocument();
  });

  it('renders discard button', () => {
    render(
      <TicketConfirmationForm
        ticket={mockTicket as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Descartar')).toBeInTheDocument();
  });

  it('shows missing fields section when ticket has null fields', () => {
    const partialTicket = {
      id: 't2', location_name: null, amount: null, currency: null,
      status: 'Pending', date: null,
      location_address: null, payment_type: null,
      items: [],
    };
    render(
      <TicketConfirmationForm
        ticket={partialTicket as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Completa estos campos')).toBeInTheDocument();
    expect(screen.getByLabelText('Establecimiento *')).toBeInTheDocument();
  });

  it('renders items list when ticket has items', () => {
    render(
      <TicketConfirmationForm
        ticket={{
          ...mockTicket,
          items: [
            { name: 'Menú del día', amount: 12.5, currency: 'EUR' },
            { name: 'Bebida', amount: 2.5, currency: 'EUR' },
          ],
        } as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Menú del día')).toBeInTheDocument();
    expect(screen.getByText('Bebida')).toBeInTheDocument();
  });
});
