import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReportDetailScreen } from './ReportDetailScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useReportQuery: vi.fn(),
  useTicketsQuery: vi.fn(),
  useSubmitReportMutation: vi.fn(),
  useDeleteTicketMutation: vi.fn(),
  useDeleteReportMutation: vi.fn(),
  useUpdateReportStatusMutation: vi.fn(),
  usePermissions: vi.fn(),
  ReportStatus: { SUBMITTED: 'SUBMITTED', APPROVED: 'APPROVED', CREATED: 'CREATED' },
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  ScanLine: () => null,
  FileText: () => null,
  Calendar: () => null,
  Wallet: () => null,
  Banknote: () => null,
  Tag: () => null,
  Plus: () => null,
  Send: () => null,
  CheckCircle: () => null,
  Trash2: () => null,
  ArrowRight: () => null,
  AlertTriangle: () => null,
  Receipt: () => null,
  TrendingUp: () => null,
  ThumbsUp: () => null,
  ThumbsDown: () => null,
  XCircle: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));
vi.mock('../tickets/components/TicketUploadModal', () => ({
  TicketUploadModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">upload-modal</div> : null,
}));
vi.mock('../tickets/components/TicketDetailModal', () => ({
  TicketDetailModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">ticket-detail</div> : null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

import {
  useReportQuery,
  useTicketsQuery,
  useSubmitReportMutation,
  useDeleteTicketMutation,
  useDeleteReportMutation,
  useUpdateReportStatusMutation,
  usePermissions,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: false, isError: false });
  (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useSubmitReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (useDeleteReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useUpdateReportStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
};

const renderScreen = () =>
  render(
    <MemoryRouter initialEntries={['/trips/r1']}>
      <Routes>
        <Route path="/trips/:id" element={<ReportDetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ReportDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('shows error state when report not found', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: false, isError: true });
    renderScreen();
    expect(screen.getByText('reportDetail.errorLoading')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: true, isError: false });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders report detail when data is available', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
        destination: 'Madrid',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('shows no tickets empty state when tickets list is empty', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getByText('reportDetail.startDigitalizing')).toBeInTheDocument();
  });
});
