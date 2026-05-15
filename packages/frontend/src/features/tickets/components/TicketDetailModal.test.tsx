/**
 * Smoke tests for `TicketDetailModal` — focuses on the conditional rendering
 * (closed, no-ticket, open with ticket) and basic structure. Sub-components
 * are stubbed so this file does not duplicate their assertions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketDetailModal } from './TicketDetailModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useTicketImageQuery: vi.fn(),
  };
});

vi.mock('../hooks/useItemApproval', () => ({
  useItemApproval: () => ({
    pendingApprovals: new Map(),
    pendingRejections: new Set(),
    approve: vi.fn(),
    reject: vi.fn(),
    save: vi.fn(),
    reset: vi.fn(),
    hasItemChanges: false,
    isSaving: false,
    getItemStatus: () => 'PENDING',
  }),
}));

vi.mock('../hooks/useTicketForm', () => ({
  useTicketForm: () => ({
    isEditing: false,
    setIsEditing: vi.fn(),
    formData: {},
    handleChange: vi.fn(),
    startEdit: vi.fn(),
    cancelEdit: vi.fn(),
    save: vi.fn(),
    isSaving: false,
  }),
}));

vi.mock('../../../components/ui/Drawer', () => ({
  Drawer: ({ isOpen, children, leftSidePanel }: any) =>
    isOpen ? (
      <div role="dialog" aria-label="ticket-drawer">
        {leftSidePanel}
        {children}
      </div>
    ) : null,
}));

vi.mock('./ImageSidePanel', () => ({
  ImageSidePanel: () => <div data-testid="image-panel" />,
}));

vi.mock('./TicketEditForm', () => ({
  TicketEditForm: () => <div data-testid="edit-form" />,
}));

vi.mock('./TicketCraftedSheet', () => ({
  TicketCraftedSheet: ({ onToggleImage }: any) => (
    <div data-testid="crafted-sheet">
      <button data-testid="toggle-image" onClick={onToggleImage} />
    </div>
  ),
}));

import { useTicketImageQuery } from '@ticket-registrator/shared';
import { fireEvent } from '@testing-library/react';

const TICKET = {
  id: 't1',
  amount: 100,
  currency: 'EUR',
  date: '2024-01-01',
  payment_type: 'CARD',
  last_four_digits: '1234',
  createdAt: '2024-01-01T10:00:00Z',
  status: 'PENDING',
  items: [],
} as any;

describe('TicketDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTicketImageQuery as any).mockReturnValue({ data: null, isLoading: false });
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <TicketDetailModal
        isOpen={false}
        onClose={() => {}}
        ticket={TICKET}
        reportId="r1"
      />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders nothing when ticket is null even if isOpen', () => {
    const { container } = render(
      <TicketDetailModal
        isOpen
        onClose={() => {}}
        ticket={null}
        reportId="r1"
      />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders the drawer with the crafted sheet when open', () => {
    render(
      <TicketDetailModal
        isOpen
        onClose={() => {}}
        ticket={TICKET}
        reportId="r1"
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('crafted-sheet')).toBeInTheDocument();
  });

  it('passes the editable flag through without crashing when set', () => {
    render(
      <TicketDetailModal
        isOpen
        onClose={() => {}}
        ticket={TICKET}
        reportId="r1"
        isEditable
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders without an image panel until the toggle is invoked', () => {
    render(
      <TicketDetailModal
        isOpen
        onClose={() => {}}
        ticket={TICKET}
        reportId="r1"
      />,
    );
    expect(screen.queryByTestId('image-panel')).not.toBeInTheDocument();
  });

  it('mounts the image side panel when the sheet toggles it on', () => {
    render(
      <TicketDetailModal
        isOpen
        onClose={() => {}}
        ticket={TICKET}
        reportId="r1"
      />,
    );
    expect(screen.queryByTestId('image-panel')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toggle-image'));
    expect(screen.getByTestId('image-panel')).toBeInTheDocument();
  });
});
