import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketDetailModal } from './TicketDetailModal';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useTicketImageQuery: vi.fn(),
    useUpdateTicketMutation: vi.fn(),
  };
});

vi.mock('date-fns', () => ({
  format: () => '10 Jan 2024',
}));
vi.mock('date-fns/locale', () => ({
  es: {},
  enUS: {},
}));

vi.mock('lucide-react', () => ({
  MapPin: () => null,
  CreditCard: () => null,
  Tag: () => null,
  ExternalLink: () => null,
  Image: () => null,
  Loader2: () => null,
  Pencil: () => <span data-testid="pencil-icon" />,
  X: () => null,
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading }: any) => (
    <button onClick={onClick} disabled={disabled || isLoading}>{children}</button>
  ),
}));
vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, name, value, onChange, type, placeholder, step }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        type={type || 'text'}
        placeholder={placeholder}
        step={step}
      />
    </div>
  ),
}));
vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

import { useTicketImageQuery, useUpdateTicketMutation } from '@ticket-registrator/shared';

const mockMutate = vi.fn();

const mockTicket = {
  id: 't1',
  location_name: 'Restaurante El Sol',
  location_address: 'Calle Mayor 1',
  amount: 25,
  currency: 'EUR',
  status: 'PENDING',
  date: '2024-01-10',
  expense_type: 'Comida',
  payment_type: 'Tarjeta',
  last_four_digits: '1234',
};

const renderModal = (props: any = {}) =>
  render(
    <TicketDetailModal
      isOpen={true}
      onClose={vi.fn()}
      ticket={mockTicket as any}
      reportId="r1"
      {...props}
    />,
  );

describe('TicketDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTicketImageQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: false });
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  // ── View mode ──────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    const { container } = renderModal();
    expect(container).toBeTruthy();
  });

  it('renders ticket location name as title', () => {
    renderModal();
    expect(screen.getByText('Restaurante El Sol')).toBeInTheDocument();
  });

  it('renders ticket amount', () => {
    renderModal();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('returns null when ticket is null', () => {
    const { container } = render(
      <TicketDetailModal isOpen={true} onClose={vi.fn()} ticket={null} reportId="r1" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when modal is closed', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders image and full-screen link when imageData has url', () => {
    (useTicketImageQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { url: 'http://example.com/ticket.jpg' },
      isLoading: false,
    });
    renderModal();
    const img = screen.getByAltText('Ticket');
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toBe('http://example.com/ticket.jpg');
    expect(screen.getByText('ticketDetail.fullscreen')).toBeInTheDocument();
  });

  it('renders loading indicator when image is loading', () => {
    (useTicketImageQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
    });
    renderModal();
    expect(screen.getByText('ticketDetail.loadingImage')).toBeInTheDocument();
  });

  it('renders no image placeholder when no imageData', () => {
    renderModal();
    expect(screen.getByText('ticketDetail.noImage')).toBeInTheDocument();
  });

  it('renders items list when ticket has items', () => {
    renderModal({
      ticket: {
        ...mockTicket,
        items: [
          { name: 'Café con leche', amount: 3.5, currency: 'EUR' },
          { name: 'Tostada', amount: 2.0, currency: 'EUR' },
        ],
      } as any,
    });
    expect(screen.getByText('Café con leche')).toBeInTheDocument();
    expect(screen.getByText('Tostada')).toBeInTheDocument();
  });

  it('renders no-items message when ticket has no items', () => {
    renderModal({ ticket: { ...mockTicket, items: [] } as any });
    expect(screen.getByText('reportDetail.noItems')).toBeInTheDocument();
  });

  // ── Edit button visibility ─────────────────────────────────────────────────

  it('does NOT show edit button when isEditable is false (default)', () => {
    renderModal();
    expect(screen.queryByTestId('edit-ticket-btn')).not.toBeInTheDocument();
  });

  it('shows edit button when isEditable is true', () => {
    renderModal({ isEditable: true });
    expect(screen.getByTestId('edit-ticket-btn')).toBeInTheDocument();
  });

  // ── Edit mode ──────────────────────────────────────────────────────────────

  it('enters edit mode when edit button is clicked', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    expect(screen.getByTestId('input-location_name')).toBeInTheDocument();
  });

  it('pre-populates form fields with current ticket values on edit', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    expect((screen.getByTestId('input-location_name') as HTMLInputElement).value).toBe('Restaurante El Sol');
    expect((screen.getByTestId('input-amount') as HTMLInputElement).value).toBe('25');
    expect((screen.getByTestId('input-currency') as HTMLInputElement).value).toBe('EUR');
  });

  it('hides edit button after entering edit mode', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    expect(screen.queryByTestId('edit-ticket-btn')).not.toBeInTheDocument();
  });

  it('shows cancel and save buttons in edit mode', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.getByText('common.save')).toBeInTheDocument();
  });

  it('cancels edit mode and returns to view when cancel is clicked', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    fireEvent.click(screen.getByText('common.cancel'));
    expect(screen.queryByTestId('input-location_name')).not.toBeInTheDocument();
    expect(screen.getByTestId('edit-ticket-btn')).toBeInTheDocument();
  });

  it('calls updateMutation.mutate with correct data on save', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));

    fireEvent.change(screen.getByTestId('input-location_name'), {
      target: { name: 'location_name', value: 'Nuevo Nombre' },
    });
    fireEvent.change(screen.getByTestId('input-amount'), {
      target: { name: 'amount', value: '30' },
    });

    fireEvent.click(screen.getByText('common.save'));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: 'r1',
        ticketId: 't1',
        data: expect.objectContaining({
          location_name: 'Nuevo Nombre',
          amount: 30,
        }),
      }),
    );
  });

  it('exits edit mode after successful save', () => {
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockImplementation(({ onSuccess }: any) => ({
      mutate: vi.fn(() => onSuccess()),
      isPending: false,
    }));

    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    fireEvent.click(screen.getByText('common.save'));
    expect(screen.queryByTestId('input-location_name')).not.toBeInTheDocument();
  });

  it('view mode shows close button', () => {
    renderModal({ isEditable: true });
    // In view mode (not editing) the close button is visible
    expect(screen.getByText('common.close')).toBeInTheDocument();
  });

  it('edit mode hides the close button', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    // In edit mode only cancel/save are shown, no close button
    expect(screen.queryByText('common.close')).not.toBeInTheDocument();
  });

  it('save button is disabled while mutation is pending', () => {
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));
    const saveBtn = screen.getByText('common.save');
    expect(saveBtn).toBeDisabled();
  });

  it('sends null for empty optional fields on save', () => {
    renderModal({ isEditable: true });
    fireEvent.click(screen.getByTestId('edit-ticket-btn'));

    // Clear location_address
    fireEvent.change(screen.getByTestId('input-location_address'), {
      target: { name: 'location_address', value: '' },
    });

    fireEvent.click(screen.getByText('common.save'));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ location_address: null }),
      }),
    );
  });
});
