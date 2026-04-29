import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
    i18n: { language: 'en' },
  }),
}));

import { UserDetailRating } from './UserDetailRating';

describe('UserDetailRating', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initially renders 0 and animates to the final value', () => {
    render(<UserDetailRating ratingValue={75} ratingColor="#0f0" ratingLabel="Great" />);
    expect(screen.getByText('0')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('renders the rating label', () => {
    render(<UserDetailRating ratingValue={50} ratingColor="#000" ratingLabel="Average" />);
    expect(screen.getByText('Average')).toBeInTheDocument();
  });

  it('renders the heading title', () => {
    render(<UserDetailRating ratingValue={50} ratingColor="#000" ratingLabel="x" />);
    expect(screen.getByRole('heading', { name: 'Reputación' })).toBeInTheDocument();
  });

  it('applies the color to the label and dot', () => {
    const { container } = render(
      <UserDetailRating ratingValue={50} ratingColor="rgb(255, 0, 0)" ratingLabel="L" />,
    );
    const label = screen.getByText('L');
    expect(label).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    const dot = container.querySelector('div.w-2.h-2.rounded-full') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('renders the "/ 100" suffix', () => {
    render(<UserDetailRating ratingValue={50} ratingColor="#000" ratingLabel="x" />);
    expect(screen.getByText('/ 100')).toBeInTheDocument();
  });
});
