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

  it('uses the same grid template as ReportRow for visual continuity', () => {
    const { container } = render(<ReportSkeletonCard />);
    const row = container.querySelector('.list-row') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.style.gridTemplateColumns).toContain('32px');
  });
});
