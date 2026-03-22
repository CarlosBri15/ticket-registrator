import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ReportDetailScreen } from './ReportDetailScreen';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

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
    <MemoryRouter initialEntries={['/reports/r1']}>
      <Routes>
        <Route path="/reports/:id" element={<ReportDetailScreen />} />
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

  it('shows ticket loading skeleton when tickets are loading', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders tickets list when tickets are available', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10', expense_type: 'Comida' },
        { id: 't2', location_name: 'Hotel Central', amount: 120, currency: 'EUR', status: 'APPROVED', date: '2024-01-11', expense_type: 'Alojamiento' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Restaurante Sol')).toBeInTheDocument();
    expect(screen.getByText('Hotel Central')).toBeInTheDocument();
  });

  it('shows delete confirm dialog when delete button is clicked', () => {
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
    fireEvent.click(screen.getByText('common.delete'));
    expect(screen.getByText('reportDetail.deleteReport')).toBeInTheDocument();
    expect(screen.getByText('reportDetail.confirmDelete')).toBeInTheDocument();
  });

  it('shows decline confirm dialog when decline button is clicked', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    fireEvent.click(screen.getAllByText('reportDetail.declineReport')[0]);
    expect(screen.getByText('reportDetail.confirmDecline')).toBeInTheDocument();
  });

  it('shows submit confirm dialog when submit button is clicked', () => {
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
    fireEvent.click(screen.getAllByText('reportDetail.submitReport')[0]);
    expect(screen.getByText('reportDetail.confirmSubmit')).toBeInTheDocument();
  });

  it('shows approve confirm dialog when approve button is clicked', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    fireEvent.click(screen.getAllByText('reportDetail.approveReport')[0]);
    expect(screen.getByText('reportDetail.confirmApprove')).toBeInTheDocument();
  });

  it('shows "in review" badge for submitted report without approve permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getByText('reportDetail.submittedReview')).toBeInTheDocument();
  });

  it('shows approved badge for APPROVED report', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'APPROVED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: 300, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getAllByText('reportDetail.approved').length).toBeGreaterThanOrEqual(1);
  });

  it('shows declined badge for DECLINED report', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'DECLINED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getByText('status.DECLINED')).toBeInTheDocument();
  });

  it('opens ticket upload modal when scan button is clicked for editable report', () => {
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
    fireEvent.click(screen.getAllByText('reportDetail.scanTicket')[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens ticket detail modal when a ticket row is clicked', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10', expense_type: 'Comida' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByText('Restaurante Sol'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders report with type tag when type is set', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
        type: 'Business Trip',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    expect(screen.getByText('Business Trip')).toBeInTheDocument();
  });

  it('calls deleteTicketMutation when ticket delete button is clicked', () => {
    const mockDeleteTicket = vi.fn();
    (useDeleteTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockDeleteTicket });
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 't1', location_name: 'Restaurante Sol', amount: 25, currency: 'EUR', status: 'PENDING', date: '2024-01-10', expense_type: 'Comida' }],
      isLoading: false,
    });
    const { container } = renderScreen();
    const deleteBtn = container.querySelector('button.w-7.h-7');
    if (deleteBtn) fireEvent.click(deleteBtn);
    expect(mockDeleteTicket).toHaveBeenCalledWith({ reportId: 'r1', ticketId: 't1' });
  });

  it('closes approve/decline confirm dialogs on updateStatusMutation.onSuccess', () => {
    let capturedOnSuccess: (() => void) | undefined;
    (useUpdateReportStatusMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate: vi.fn(), isPending: false };
    });
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'SUBMITTED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: null, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    renderScreen();
    fireEvent.click(screen.getAllByText('reportDetail.approveReport')[0]);
    expect(screen.getByText('reportDetail.confirmApprove')).toBeInTheDocument();
    act(() => { capturedOnSuccess?.(); });
    expect(screen.queryByText('reportDetail.confirmApprove')).not.toBeInTheDocument();
  });

  it('navigates to reports list when back button is clicked', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate as any).mockReturnValue(mockNavigate);

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
    fireEvent.click(screen.getByText('reportDetail.backToTrips'));
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('calls deleteReportMutation and navigates on success', () => {
    const mockDeleteReport = vi.fn();
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate as any).mockReturnValue(mockNavigate);

    let capturedOnSuccess: (() => void) | undefined;
    (useDeleteReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate: mockDeleteReport, isPending: false };
    });

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
    
    // Open delete dialog
    fireEvent.click(screen.getByText('common.delete'));
    
    // Confirm delete
    fireEvent.click(screen.getAllByText('common.delete')[1]); // The one in the dialog
    expect(mockDeleteReport).toHaveBeenCalledWith('r1');

    // Simulate success
    act(() => { capturedOnSuccess?.(); });
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('calculates financial summary correctly with pending tickets', () => {
    (useReportQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        requested_amount: 300, approved_amount: 50, currency: 'EUR',
      },
      isLoading: false,
      isError: false,
    });
    (useTicketsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 't1', amount: 100, status: 'PENDING', currency: 'EUR' },
        { id: 't2', amount: 50, status: 'APPROVED', currency: 'EUR' },
        { id: 't3', amount: 75, status: 'PENDING', currency: 'EUR' },
      ],
      isLoading: false,
    });
    renderScreen();
    
    // Pending amount should be 100 + 75 = 175
    expect(screen.getByText('175')).toBeInTheDocument();
  });

  it('closes submit dialog when cancel is clicked', () => {
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
    
    fireEvent.click(screen.getAllByText('reportDetail.submitReport')[0]);
    expect(screen.getByText('reportDetail.confirmSubmit')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('common.cancel'));
    expect(screen.queryByText('reportDetail.confirmSubmit')).not.toBeInTheDocument();
  });
});
