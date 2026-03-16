import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
