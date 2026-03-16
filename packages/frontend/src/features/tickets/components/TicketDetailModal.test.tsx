import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketDetailModal } from './TicketDetailModal';

vi.mock('@ticket-registrator/shared', () => ({
  useTicketImageQuery: vi.fn(),
}));

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
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
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

import { useTicketImageQuery } from '@ticket-registrator/shared';

const mockTicket = {
  id: 't1', location_name: 'Restaurante El Sol', amount: 25, currency: 'EUR',
  status: 'PENDING', date: '2024-01-10', expense_type: 'Comida',
};

const renderModal = (props = {}) =>
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
  });

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
    expect(screen.getByText('Ver pantalla completa')).toBeInTheDocument();
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
});
