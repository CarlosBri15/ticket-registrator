import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('lucide-react', () => ({
  Users: () => <svg data-testid="icon-users" />,
  Building2: () => <svg data-testid="icon-building2" />,
  Layers: () => <svg data-testid="icon-layers" />,
  Lock: () => <svg data-testid="icon-lock" />,
  Shield: () => <svg data-testid="icon-shield" />,
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { QuickActionsGrid } from './QuickActionsGrid';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('QuickActionsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('returns null when no links pass the can() filter', () => {
    const { container } = render(
      <QuickActionsGrid navigate={vi.fn()} can={() => false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders links that pass can() filter', () => {
    render(
      <QuickActionsGrid
        navigate={vi.fn()}
        can={(p) => p === 'view_users'}
      />,
    );
    expect(screen.getByText('layout.users')).toBeInTheDocument();
  });

  it('calls navigate when a link is clicked', () => {
    const navigate = vi.fn();
    render(
      <QuickActionsGrid
        navigate={navigate}
        can={(p) => p === 'view_users'}
      />,
    );
    fireEvent.click(screen.getByText('layout.users'));
    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('renders correct number of links based on permissions', () => {
    const allowedPerms = new Set(['view_users', 'view_departments', 'view_roles']);
    render(
      <QuickActionsGrid
        navigate={vi.fn()}
        can={(p) => allowedPerms.has(p)}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('filters out links where can() returns false for that permission', () => {
    render(
      <QuickActionsGrid
        navigate={vi.fn()}
        can={(p) => p === 'view_roles'}
      />,
    );
    expect(screen.getByText('layout.roles')).toBeInTheDocument();
    expect(screen.queryByText('layout.users')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.departments')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.permissions')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.organizations')).not.toBeInTheDocument();
  });
});
