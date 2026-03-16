import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

const icon = <svg data-testid="icon" />;

describe('StatCard', () => {
  describe('default variant', () => {
    it('renders title and value', () => {
      render(<StatCard title="Total Reports" value="42" icon={icon} />);
      expect(screen.getByText('Total Reports')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders icon', () => {
      render(<StatCard title="Reports" value="5" icon={icon} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<StatCard title="Reports" value="5" icon={icon} subtitle="This month" />);
      expect(screen.getByText('This month')).toBeInTheDocument();
    });

    it('does not render subtitle when absent', () => {
      render(<StatCard title="Reports" value="5" icon={icon} />);
      expect(screen.queryByText('This month')).not.toBeInTheDocument();
    });

    it('renders trend when provided', () => {
      render(<StatCard title="Reports" value="5" icon={icon} trend="+12%" trendUp />);
      expect(screen.getByText('+12%')).toBeInTheDocument();
    });

    it('does not render trend when absent', () => {
      render(<StatCard title="Reports" value="5" icon={icon} />);
      expect(screen.queryByText('+12%')).not.toBeInTheDocument();
    });
  });

  describe('primary variant', () => {
    it('renders title and value', () => {
      render(<StatCard title="Budget" value="$1,000" icon={icon} variant="primary" />);
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    it('renders trend with trendUp styling', () => {
      render(<StatCard title="Budget" value="$1k" icon={icon} variant="primary" trend="+5%" trendUp />);
      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('renders trend with trendDown styling', () => {
      render(<StatCard title="Budget" value="$1k" icon={icon} variant="primary" trend="-3%" trendUp={false} />);
      expect(screen.getByText('-3%')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      render(<StatCard title="Budget" value="$1k" icon={icon} variant="primary" subtitle="Q1" />);
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });
  });

  describe('ghost variant', () => {
    it('renders title and value', () => {
      render(<StatCard title="Users" value="99" icon={icon} variant="ghost" />);
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('renders trend', () => {
      render(<StatCard title="Users" value="99" icon={icon} variant="ghost" trend="+10%" trendUp />);
      expect(screen.getByText('+10%')).toBeInTheDocument();
    });
  });
});
