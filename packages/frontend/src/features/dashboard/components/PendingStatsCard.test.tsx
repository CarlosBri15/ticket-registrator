import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PendingStatsCard } from './PendingStatsCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
}));

describe('PendingStatsCard', () => {
  it('renders "everything clear" state when count is 0', () => {
    render(<PendingStatsCard count={0} />);
    expect(screen.getByText('home.allCaughtUp')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('renders pending count when count > 0', () => {
    render(<PendingStatsCard count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('home.requiresReview')).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('customizes label if provided', () => {
    render(<PendingStatsCard count={3} label="Pendientes" />);
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
  });
});
