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
  status: 'PENDING', date: '2024-01-10', expense_type: 'Comida',
  location_address: 'Calle Mayor 1', payment_type: 'Tarjeta',
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
});
