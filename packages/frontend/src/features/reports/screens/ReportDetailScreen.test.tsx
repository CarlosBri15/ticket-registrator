/**
 * Smoke tests for `ReportDetailScreen` — covers the loading skeleton, the
 * error/empty state, and the happy-path render. Sub-components, hooks, and
 * lazy chart wrappers are stubbed because their own tests assert their flows.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReportDetailScreen } from './ReportDetailScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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
    useReportQuery: vi.fn(),
    useTicketsQuery: vi.fn(),
    usePermissions: vi.fn(),
    useUserQuery: vi.fn(() => ({ data: { id: 'me' } })),
  };
});

vi.mock('../hooks/useReportDetailActions', () => ({
  useReportDetailActions: () => ({
    // Modal visibility
    submitConfirm: false,
    setSubmitConfirm: vi.fn(),
    deleteConfirm: false,
    setDeleteConfirm: vi.fn(),
    approveConfirm: false,
    setApproveConfirm: vi.fn(),
    declineConfirm: false,
    setDeclineConfirm: vi.fn(),
    // Mutation state
    isSubmitting: false,
    isDeleting: false,
    isUpdatingStatus: false,
    // Handlers
    handleSubmit: vi.fn(),
    handleDelete: vi.fn(),
    handleApprove: vi.fn(),
    handleDecline: vi.fn(),
  }),
}));

vi.mock('../../../components/ui/Charts', () => ({
  DonutChart: () => <div data-testid="donut" />,
  AreaTrendChart: () => <div data-testid="area" />,
}));

vi.mock('../../../components/ui/LazyCharts', () => ({
  DonutChart: () => <div data-testid="donut" />,
  AreaTrendChart: () => <div data-testid="area" />,
}));

vi.mock('../../tickets/components/TicketUploadModal', () => ({
  TicketUploadModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="upload-modal" /> : null,
}));

vi.mock('../../tickets/components/TicketDetailModal', () => ({
  TicketDetailModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="ticket-modal" /> : null,
}));

vi.mock('../../tickets/components/TicketsTable', () => ({
  TicketsTable: () => <div data-testid="tickets-table" />,
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('../components/ConfirmDialog', () => ({
  ConfirmDialog: ({ title }: any) => <div data-testid="confirm-dialog">{title}</div>,
}));

import {
  useReportQuery,
  useTicketsQuery,
  usePermissions,
} from '@ticket-registrator/shared';

const REPORT = {
  id: 'r1',
  name: 'Trip 1',
  status: 'CREATED',
  start_date: '2024-01-01',
  end_date: '2024-01-10',
  requested_amount: 500,
  approved_amount: 0,
  currency: 'EUR',
  type: 'Business',
  user_id: 'u1',
};

const renderScreen = (id = 'r1') =>
  render(
    <MemoryRouter initialEntries={[`/reports/${id}`]}>
      <Routes>
        <Route path="/reports/:id" element={<ReportDetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );

const setupMocks = (overrides: any = {}) => {
  (useReportQuery as any).mockReturnValue({
    data: REPORT,
    isLoading: false,
    isError: false,
  });
  (useTicketsQuery as any).mockReturnValue({ data: [], isLoading: false });
  (usePermissions as any).mockReturnValue({ can: () => true });
  Object.entries(overrides).forEach(([k, v]) => {
    const map: Record<string, any> = { useReportQuery, useTicketsQuery, usePermissions };
    if (map[k]) map[k].mockReturnValue(v);
  });
};

describe('ReportDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders the loading skeleton while data is in flight', () => {
    setupMocks({
      useReportQuery: { data: undefined, isLoading: true, isError: false },
    });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders the error empty state when the query fails', () => {
    setupMocks({
      useReportQuery: { data: undefined, isLoading: false, isError: true },
    });
    renderScreen();
    expect(screen.getByText('reportDetail.errorLoading')).toBeInTheDocument();
  });

  it('navigates back to /reports from the error state', () => {
    setupMocks({
      useReportQuery: { data: undefined, isLoading: false, isError: true },
    });
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /common\.cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('renders the report name and status badge on the happy path', () => {
    renderScreen();
    expect(screen.getByText('Trip 1')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('CREATED');
  });

  it('renders the tickets table component', () => {
    renderScreen();
    expect(screen.getByTestId('tickets-table')).toBeInTheDocument();
  });

  it('renders the analytics charts when there are tickets with items', () => {
    setupMocks({
      useTicketsQuery: {
        data: [
          {
            id: 't1', amount: 100, items: [{ id: 'i1', amount: 100, categoryName: 'Travel' }],
          },
        ],
        isLoading: false,
      },
    });
    renderScreen();
    expect(screen.getByTestId('donut')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
  });

  it('does not render charts when there are no tickets', () => {
    renderScreen();
    expect(screen.queryByTestId('donut')).not.toBeInTheDocument();
  });

  // ── New header behaviour tests ─────────────────────────────────────────────

  it('renders the headline amount and currency in the header', () => {
    // REPORT has requested_amount=500, currency='EUR', status=CREATED (not approved)
    // headlineAmount = ticketsTotal(0) || requested_amount(500) = 500
    renderScreen();
    // toLocaleString() of 500 → '500' (no tickets so ticketsTotal is 0, fallback to requested_amount)
    expect(screen.getByText('500')).toBeInTheDocument();
    // Currency label rendered separately as a <span>
    const currencyNodes = screen.getAllByText('EUR');
    expect(currencyNodes.length).toBeGreaterThan(0);
  });

  it('renders the "rejected" line when report is approved and approved_amount < requested_amount', () => {
    setupMocks({
      useReportQuery: {
        data: {
          ...REPORT,
          status: 'APPROVED',
          requested_amount: 1000,
          approved_amount: 800,
        },
        isLoading: false,
        isError: false,
      },
      useTicketsQuery: { data: [], isLoading: false },
    });
    renderScreen();
    // rejected = 1000 - 800 = 200; label key is 'reportDetail.rejected'.
    // Multiple elements may match (header span + FinancialSummary dt), so use getAllByText.
    const rejectedNodes = screen.getAllByText(/reportDetail\.rejected/i);
    expect(rejectedNodes.length).toBeGreaterThan(0);
    // The header span includes the full text 'reportDetail.rejected · 200 EUR'
    const headerSpan = rejectedNodes.find(
      (el) => el.tagName.toLowerCase() === 'span',
    );
    expect(headerSpan).toBeInTheDocument();
    expect(headerSpan?.textContent).toMatch(/200/);
  });

  it('does NOT render the "rejected" line when approved_amount equals requested_amount', () => {
    setupMocks({
      useReportQuery: {
        data: {
          ...REPORT,
          status: 'APPROVED',
          requested_amount: 500,
          approved_amount: 500,
        },
        isLoading: false,
        isError: false,
      },
      useTicketsQuery: { data: [], isLoading: false },
    });
    renderScreen();
    expect(screen.queryByText(/reportDetail\.rejected/i)).not.toBeInTheDocument();
  });

  it('renders ticket count in the meta-row via layout.allTickets label', () => {
    setupMocks({
      useTicketsQuery: {
        data: [
          { id: 't1', amount: 100, items: [] },
          { id: 't2', amount: 50, items: [] },
          { id: 't3', amount: 75, items: [] },
        ],
        isLoading: false,
      },
    });
    renderScreen();
    // Both the meta-row MetaItem and the section heading use 'layout.allTickets' as label.
    const labels = screen.getAllByText('layout.allTickets');
    expect(labels.length).toBeGreaterThanOrEqual(1);
    // The MetaItem value span (tabular-nums class) must contain '3'.
    // Multiple '3' nodes may exist (section badge), so check the tabular-nums spans.
    const tabularSpans = document
      .querySelectorAll('span.tabular-nums');
    const countSpan = Array.from(tabularSpans).find(
      (el) => el.textContent?.trim() === '3',
    );
    expect(countSpan).toBeInTheDocument();
  });

  it('renders the reportDetail.totalRequested label in the header for non-approved reports', () => {
    renderScreen();
    // When not approved, the label span shows only 'reportDetail.totalRequested'
    expect(screen.getByText('reportDetail.totalRequested')).toBeInTheDocument();
  });

  it('renders the approved label prefix when report is approved', () => {
    setupMocks({
      useReportQuery: {
        data: {
          ...REPORT,
          status: 'APPROVED',
          requested_amount: 500,
          approved_amount: 500,
        },
        isLoading: false,
        isError: false,
      },
      useTicketsQuery: { data: [], isLoading: false },
    });
    renderScreen();
    // When approved, label = 'reportDetail.approved · reportDetail.totalRequested'
    expect(
      screen.getByText('reportDetail.approved · reportDetail.totalRequested'),
    ).toBeInTheDocument();
  });
});
