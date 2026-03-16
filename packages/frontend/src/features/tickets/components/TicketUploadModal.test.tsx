import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TicketUploadModal } from './TicketUploadModal';

vi.mock('@ticket-registrator/shared', () => ({
  useUploadTicketMutation: vi.fn(),
  useUpdateTicketMutation: vi.fn(),
  useDeleteTicketMutation: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Upload: () => null,
  File: () => null,
  AlertCircle: () => null,
  Sparkles: () => null,
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock('./TicketConfirmationForm', () => ({
  TicketConfirmationForm: () => <div>confirmation-form</div>,
}));

import {
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} from '@ticket-registrator/shared';

describe('TicketUploadModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUploadTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useDeleteTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />,
    );
    expect(container).toBeTruthy();
  });

  it('renders upload title', () => {
    render(<TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />);
    expect(screen.getByText('Subir Ticket de Gasto')).toBeInTheDocument();
  });

  it('renders drag area text', () => {
    render(<TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />);
    expect(screen.getByText('Arrastra tu ticket aquí')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <TicketUploadModal isOpen={false} onClose={vi.fn()} reportId="r1" />,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows file name and remove button when file is selected', () => {
    const { container } = render(
      <TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'receipt.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      configurable: true,
    });
    fireEvent.change(input);
    expect(screen.getByText('receipt.jpg')).toBeInTheDocument();
    expect(screen.getByText('Quitar archivo')).toBeInTheDocument();
  });

  it('shows confirm step when upload succeeds', () => {
    let capturedConfig: any;
    (useUploadTicketMutation as ReturnType<typeof vi.fn>).mockImplementation((config: any) => {
      capturedConfig = config;
      return { mutate: vi.fn(), isPending: false };
    });

    render(<TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />);

    act(() => {
      capturedConfig.onSuccess({
        id: 't1', location_name: 'Test Restaurant', amount: 25, currency: 'EUR',
        status: 'PENDING', date: '2024-01-10', expense_type: 'Comida',
        location_address: 'Calle 1', payment_type: 'Tarjeta',
      });
    });

    expect(screen.getByText('Confirmar Datos Extraídos')).toBeInTheDocument();
    expect(screen.getByText('confirmation-form')).toBeInTheDocument();
  });

  it('shows missing fields warning in confirm step when ticket has null fields', () => {
    let capturedConfig: any;
    (useUploadTicketMutation as ReturnType<typeof vi.fn>).mockImplementation((config: any) => {
      capturedConfig = config;
      return { mutate: vi.fn(), isPending: false };
    });

    render(<TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />);

    act(() => {
      capturedConfig.onSuccess({
        id: 't1', location_name: null, amount: null, currency: null,
        status: 'PENDING', date: null, expense_type: null,
        location_address: null, payment_type: null,
      });
    });

    expect(screen.getByText(/La IA no pudo leer algunos campos/i)).toBeInTheDocument();
  });

  it('calls uploadMutation.mutate when Procesar con IA is clicked with a file', () => {
    const mutateFn = vi.fn();
    (useUploadTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mutateFn, isPending: false });

    const { container } = render(
      <TicketUploadModal isOpen={true} onClose={vi.fn()} reportId="r1" />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'receipt.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [mockFile], configurable: true });
    fireEvent.change(input);

    fireEvent.click(screen.getByText('Procesar con IA'));
    expect(mutateFn).toHaveBeenCalledWith(expect.objectContaining({ reportId: 'r1' }));
  });
});
