import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyStatsCard, PendingAmountCard } from './ControllerStatsCards';

describe('ControllerStatsCards', () => {
  describe('WeeklyStatsCard', () => {
    it('renders correctly with green colorClass', () => {
      render(
        <WeeklyStatsCard
          title="TEST TITLE"
          count={10}
          icon={<span data-testid="test-icon">icon</span>}
          colorClass="green"
          subtitle="test subtitle"
        />
      );
      expect(screen.getByText('TEST TITLE')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('test subtitle')).toBeInTheDocument();
      
      const statValue = screen.getByTestId('stat-value');
      expect(statValue).not.toHaveClass('text-red-700');
    });

    it('renders with red classes when count > 0 and colorClass is red', () => {
      render(
        <WeeklyStatsCard
          title="RED TITLE"
          count={5}
          icon={<span>icon</span>}
          colorClass="red"
          subtitle="danger"
        />
      );
      const title = screen.getByText('RED TITLE');
      expect(title).toHaveClass('text-red-500');

      const statValue = screen.getByTestId('stat-value');
      expect(statValue).toHaveClass('text-red-600');
    });

    it('renders with slate colors when count is 0 and colorClass is red', () => {
        render(
          <WeeklyStatsCard
            title="ZERO TITLE"
            count={0}
            icon={<span>icon</span>}
            colorClass="red"
            subtitle="zero"
          />
        );
        const title = screen.getByText('ZERO TITLE');
        expect(title).toHaveClass('text-slate-400');

        const statValue = screen.getByTestId('stat-value');
        expect(statValue).toHaveClass('text-dark');
      });
  });

  describe('PendingAmountCard', () => {
    it('renders amount rounded to whole units', () => {
      render(<PendingAmountCard amount={123.456} />);
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('Importe pendiente')).toBeInTheDocument();
    });
  });
});
