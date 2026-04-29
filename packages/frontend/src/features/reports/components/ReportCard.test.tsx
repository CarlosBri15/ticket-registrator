import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { enUS } from 'date-fns/locale';

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

import { ReportCard } from './ReportCard';

const buildReport = (overrides: any = {}) => ({
  id: 'r1',
  name: 'Trip to Madrid',
  status: 'CREATED',
  start_date: '2024-01-15T00:00:00.000Z',
  end_date: '2024-01-20T00:00:00.000Z',
  requested_amount: 350,
  approved_amount: null,
  currency: 'EUR',
  type: 'Business',
  ...overrides,
});

describe('ReportCard', () => {
  it('renders the report name', () => {
    render(<ReportCard report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText('Trip to Madrid')).toBeInTheDocument();
  });

  it('renders the report type when present', () => {
    render(<ReportCard report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('hides type bullet/text when type is missing', () => {
    render(
      <ReportCard report={buildReport({ type: null })} onClick={vi.fn()} dateLocale={enUS} />,
    );
    expect(screen.queryByText('Business')).not.toBeInTheDocument();
  });

  it('renders the requested amount and currency', () => {
    render(<ReportCard report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText(/350/)).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<ReportCard report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('CREATED');
  });

  it('renders only one date when start equals end', () => {
    const r = buildReport({ start_date: '2024-01-15', end_date: '2024-01-15' });
    render(<ReportCard report={r} onClick={vi.fn()} dateLocale={enUS} />);
    const dateNodes = screen.getAllByText(/15 Jan/);
    expect(dateNodes).toHaveLength(1);
  });

  it('renders date range with separator when start differs from end', () => {
    render(<ReportCard report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText(/15 Jan.*–.*20 Jan/)).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ReportCard report={buildReport()} onClick={onClick} dateLocale={enUS} />);
    fireEvent.click(screen.getByText('Trip to Madrid'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders 0 amount when requested_amount is null/undefined', () => {
    render(
      <ReportCard
        report={buildReport({ requested_amount: null })}
        onClick={vi.fn()}
        dateLocale={enUS}
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
