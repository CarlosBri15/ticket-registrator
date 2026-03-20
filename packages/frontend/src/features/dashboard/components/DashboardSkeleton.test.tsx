import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DashboardSkeleton } from './DashboardSkeleton';

describe('DashboardSkeleton', () => {
  it('renders pulse placeholders', () => {
    const { container } = render(<DashboardSkeleton />);
    const pulseDivs = container.querySelectorAll('.animate-pulse');
    expect(pulseDivs.length).toBeGreaterThan(0);
  });
});
