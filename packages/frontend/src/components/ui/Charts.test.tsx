import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', () => {
  const Comp = ({ children }: any) => <div>{children}</div>;
  return {
    ResponsiveContainer: Comp,
    PieChart: Comp,
    Pie: () => null,
    AreaChart: Comp,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

import { vi } from 'vitest';
import { DonutChart, AreaTrendChart } from './Charts';

describe('DonutChart', () => {
  const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 70 },
  ];

  it('renders without crashing with empty data', () => {
    const { container } = render(<DonutChart data={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders centerValue when provided', () => {
    render(<DonutChart data={data} centerValue="100" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders centerLabel when provided', () => {
    render(<DonutChart data={data} centerLabel="Total" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders both center value and label together', () => {
    render(<DonutChart data={data} centerValue="$1k" centerLabel="Spent" />);
    expect(screen.getByText('$1k')).toBeInTheDocument();
    expect(screen.getByText('Spent')).toBeInTheDocument();
  });

  it('does not render center overlay when no centerLabel/centerValue', () => {
    const { container } = render(<DonutChart data={data} />);
    expect(container.querySelector('.pointer-events-none')).not.toBeInTheDocument();
  });

  it('respects custom height prop', () => {
    const { container } = render(<DonutChart data={data} height={300} />);
    expect((container.firstChild as HTMLElement).style.height).toBe('300px');
  });
});

describe('AreaTrendChart', () => {
  const data = [
    { date: 'Jan', value: 10 },
    { date: 'Feb', value: 20 },
  ];

  it('renders without crashing with data', () => {
    const { container } = render(<AreaTrendChart data={data} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('respects custom height prop', () => {
    const { container } = render(<AreaTrendChart data={data} height={150} />);
    expect((container.firstChild as HTMLElement).style.height).toBe('150px');
  });

  it('renders with empty data', () => {
    const { container } = render(<AreaTrendChart data={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with currency suffix prop without crashing', () => {
    const { container } = render(<AreaTrendChart data={data} currency="USD" />);
    expect(container.firstChild).toBeTruthy();
  });
});
