import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReportSkeletonCard } from './ReportSkeletonCard';

describe('ReportSkeletonCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReportSkeletonCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies the animate-pulse class for the loading effect', () => {
    const { container } = render(<ReportSkeletonCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders six placeholder bars matching the row layout', () => {
    const { container } = render(<ReportSkeletonCard />);
    const bars = container.querySelectorAll('div.bg-dark\\/6');
    expect(bars.length).toBe(6);
  });
});
