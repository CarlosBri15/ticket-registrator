import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { enUS } from 'date-fns/locale';

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

import { ReportRow, ReportRowItem } from './ReportRow';

const buildReport = (overrides: any = {}) => ({
  id: 'r1',
  name: 'Trip to Madrid',
  status: 'CREATED',
  start_date: '2024-01-15T00:00:00.000Z',
  end_date: '2024-01-20T00:00:00.000Z',
  requested_amount: 350,
  approved_amount: 200,
  currency: 'EUR',
  type: 'Business',
  ...overrides,
});

describe('ReportRow', () => {
  it('renders the report name and type', () => {
    render(<ReportRow report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText('Trip to Madrid')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('hides the type subtitle when type is missing', () => {
    render(
      <ReportRow report={buildReport({ type: null })} onClick={vi.fn()} dateLocale={enUS} />,
    );
    expect(screen.queryByText('Business')).not.toBeInTheDocument();
  });

  it('prefers approved_amount over requested_amount when present', () => {
    render(<ReportRow report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('falls back to requested_amount when approved_amount is null', () => {
    render(
      <ReportRow
        report={buildReport({ approved_amount: null })}
        onClick={vi.fn()}
        dateLocale={enUS}
      />,
    );
    expect(screen.getByText(/350/)).toBeInTheDocument();
  });

  it('renders the StatusBadge', () => {
    render(<ReportRow report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('CREATED');
  });

  it('renders date range with both start and end when different', () => {
    render(<ReportRow report={buildReport()} onClick={vi.fn()} dateLocale={enUS} />);
    expect(screen.getByText(/15 Jan.*–.*20 Jan/)).toBeInTheDocument();
  });

  it('renders only single date when start equals end', () => {
    render(
      <ReportRow
        report={buildReport({ start_date: '2024-01-15', end_date: '2024-01-15' })}
        onClick={vi.fn()}
        dateLocale={enUS}
      />,
    );
    const matches = screen.getAllByText(/15 Jan/);
    expect(matches).toHaveLength(1);
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ReportRow report={buildReport()} onClick={onClick} dateLocale={enUS} />);
    fireEvent.click(screen.getByText('Trip to Madrid'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('ReportRowItem', () => {
  it('renders content and fires onClick (compact variant)', () => {
    const onClick = vi.fn();
    render(<ReportRowItem report={buildReport()} onClick={onClick} dateLocale={enUS} />);
    expect(screen.getByText('Trip to Madrid')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Trip to Madrid'));
    expect(onClick).toHaveBeenCalled();
  });
});
