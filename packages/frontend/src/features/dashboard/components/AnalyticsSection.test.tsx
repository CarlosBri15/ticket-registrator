import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: () => null,
  Pie: () => null,
  Legend: () => null,
}));

vi.mock('lucide-react', () => ({
  BarChart2: () => <svg data-testid="icon-bar-chart2" />,
}));

vi.mock('../../../utils/reportAnalytics', () => ({
  getMonthlyExpenses: vi.fn(),
  getExpensesByType: vi.fn(),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getMonthlyExpenses, getExpensesByType } from '../../../utils/reportAnalytics';
import { AnalyticsSection } from './AnalyticsSection';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {
  (getMonthlyExpenses as ReturnType<typeof vi.fn>).mockReturnValue([
    { month: 'Jan', amount: 500 },
    { month: 'Feb', amount: 300 },
  ]);
  (getExpensesByType as ReturnType<typeof vi.fn>).mockReturnValue([
    { type: 'Transport', amount: 200 },
    { type: 'Food', amount: 100 },
  ]);
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('returns null when both monthly and byType are empty', () => {
    (getMonthlyExpenses as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (getExpensesByType as ReturnType<typeof vi.fn>).mockReturnValue([]);
    const { container } = render(<AnalyticsSection reports={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders analytics title when data exists', () => {
    render(<AnalyticsSection reports={[]} />);
    expect(screen.getByText('analytics.title')).toBeInTheDocument();
  });

  it('renders BarChart when monthly data exists', () => {
    render(<AnalyticsSection reports={[]} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows "analytics.noData" when monthly is empty but byType exists', () => {
    (getMonthlyExpenses as ReturnType<typeof vi.fn>).mockReturnValue([]);
    render(<AnalyticsSection reports={[]} />);
    expect(screen.getByText('analytics.noData')).toBeInTheDocument();
  });

  it('shows "analytics.noData" in pie section when byType is empty but monthly exists', () => {
    (getExpensesByType as ReturnType<typeof vi.fn>).mockReturnValue([]);
    render(<AnalyticsSection reports={[]} />);
    expect(screen.getByText('analytics.noData')).toBeInTheDocument();
  });
});
