import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UserSkeletonCard } from './UserSkeletonCard';

describe('UserSkeletonCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserSkeletonCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies the animate-pulse class for the loading effect', () => {
    const { container } = render(<UserSkeletonCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('uses the same grid template as UserRow for visual continuity', () => {
    const { container } = render(<UserSkeletonCard />);
    const grid = container.querySelector('.grid') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain('32px');
  });
});
