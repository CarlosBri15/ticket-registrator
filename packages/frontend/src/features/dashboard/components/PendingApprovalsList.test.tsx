import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { es } from 'date-fns/locale';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('lucide-react', () => ({
  CheckCircle: () => <svg data-testid="icon-check-circle" />,
  Calendar: () => <svg data-testid="icon-calendar" />,
  ChevronRight: () => <svg data-testid="icon-chevron-right" />,
  Clock: () => <svg data-testid="icon-clock" />,
}));

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { PendingApprovalsList } from './PendingApprovalsList';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {};

const t = (key: string) => key;

const makeReport = (i: number) => ({
  id: `report-${i}`,
  name: `Report ${i}`,
  status: 'SUBMITTED',
  end_date: '2026-03-10T00:00:00.000Z',
  requested_amount: 100.0 + i,
  currency: 'EUR',
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PendingApprovalsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders empty state when reports is empty array', () => {
    render(
      <PendingApprovalsList
        reports={[]}
        navigate={vi.fn()}
        dateLocale={es}
        t={t}
      />,
    );
    expect(screen.getByText('home.noPendingApprovals')).toBeInTheDocument();
  });

  it('renders report names when reports provided', () => {
    const reports = [makeReport(1), makeReport(2)] as any[];
    render(
      <PendingApprovalsList
        reports={reports}
        navigate={vi.fn()}
        dateLocale={es}
        t={t}
      />,
    );
    expect(screen.getByText('Report 1')).toBeInTheDocument();
    expect(screen.getByText('Report 2')).toBeInTheDocument();
  });

  it('calls navigate when report row is clicked', () => {
    const navigate = vi.fn();
    const reports = [makeReport(1)] as any[];
    render(
      <PendingApprovalsList
        reports={reports}
        navigate={navigate}
        dateLocale={es}
        t={t}
      />,
    );
    fireEvent.click(screen.getByText('Report 1'));
    expect(navigate).toHaveBeenCalledWith('/trips/report-1');
  });

  it('shows "ver todos" button when more than 6 reports', () => {
    const reports = Array.from({ length: 7 }, (_, i) => makeReport(i + 1)) as any[];
    render(
      <PendingApprovalsList
        reports={reports}
        navigate={vi.fn()}
        dateLocale={es}
        t={t}
      />,
    );
    expect(screen.getByText(/common\.viewAll/)).toBeInTheDocument();
  });

  it('does not show "ver todos" when 6 or fewer reports', () => {
    const reports = Array.from({ length: 6 }, (_, i) => makeReport(i + 1)) as any[];
    render(
      <PendingApprovalsList
        reports={reports}
        navigate={vi.fn()}
        dateLocale={es}
        t={t}
      />,
    );
    expect(screen.queryByText(/common\.viewAll/)).not.toBeInTheDocument();
  });

  it('renders up to 6 reports (shows 6 of 7)', () => {
    const reports = Array.from({ length: 7 }, (_, i) => makeReport(i + 1)) as any[];
    render(
      <PendingApprovalsList
        reports={reports}
        navigate={vi.fn()}
        dateLocale={es}
        t={t}
      />,
    );
    // Report 7 should not be rendered (slice(0, 6))
    expect(screen.getByText('Report 1')).toBeInTheDocument();
    expect(screen.getByText('Report 6')).toBeInTheDocument();
    expect(screen.queryByText('Report 7')).not.toBeInTheDocument();
  });
});
