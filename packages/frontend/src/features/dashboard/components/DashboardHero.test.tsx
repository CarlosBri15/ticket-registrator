import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHero } from './DashboardHero';

vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

describe('DashboardHero', () => {
  const mockUser = {
    name: 'Juan Pérez',
    roleName: 'Admin',
  };

  const mockT = (key: string, opts?: any) => (opts?.name ? `${key} ${opts.name}` : key);

  it('renders correctly with given user and greeting', () => {
    render(
      <DashboardHero
        user={mockUser}
        t={mockT}
        greetingKey="home.greetingDay"
        firstName="Juan"
        subtitle="Panel"
        subtitleIcon={<div />}
      />
    );
    expect(screen.getByText(/home\.greetingDay Juan/)).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders subtitle and icon if provided', () => {
    render(
      <DashboardHero
        user={mockUser}
        t={mockT}
        greetingKey="home.greetingDay"
        firstName="Juan"
        subtitle="Mi subtítulo"
        subtitleIcon={<div data-testid="sub-icon" />}
      />
    );
    expect(screen.getByText('Mi subtítulo')).toBeInTheDocument();
    expect(screen.getByTestId('sub-icon')).toBeInTheDocument();
  });

  it('renders actions if provided', () => {
    render(
      <DashboardHero
        user={mockUser}
        t={mockT}
        greetingKey="home.greetingDay"
        firstName="Juan"
        subtitle="Panel"
        subtitleIcon={<div />}
        actions={<button>Click me</button>}
      />
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
