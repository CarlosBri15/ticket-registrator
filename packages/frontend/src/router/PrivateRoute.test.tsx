import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

// Mock Navigate to avoid react-router-dom internal hook conflicts
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

vi.mock('@ticket-registrator/shared', () => ({
  useUserQuery: vi.fn(),
  usePermissions: vi.fn(),
}));

import { useUserQuery, usePermissions } from '@ticket-registrator/shared';

const mockUseUserQuery = useUserQuery as ReturnType<typeof vi.fn>;
const mockUsePermissions = usePermissions as ReturnType<typeof vi.fn>;

const renderRoute = (children = <span>Protected</span>, permission?: string, fallback?: string) =>
  render(
    <MemoryRouter>
      <PrivateRoute permission={permission as any} fallback={fallback}>
        {children}
      </PrivateRoute>
    </MemoryRouter>,
  );

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseUserQuery.mockReturnValue({ data: null, isLoading: false });
    mockUsePermissions.mockReturnValue({ can: vi.fn().mockReturnValue(false) });
  });

  it('redirects to /login when no token', () => {
    renderRoute();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('shows spinner while loading user data', () => {
    localStorage.setItem('access_token', 'token-123');
    mockUseUserQuery.mockReturnValue({ data: null, isLoading: true });

    const { container } = renderRoute();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders children when token exists and no permission required', () => {
    localStorage.setItem('access_token', 'token-123');
    mockUseUserQuery.mockReturnValue({ data: { id: 'u1' }, isLoading: false });

    renderRoute(<span>Protected Content</span>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has required permission', () => {
    localStorage.setItem('access_token', 'token-123');
    mockUseUserQuery.mockReturnValue({ data: { id: 'u1' }, isLoading: false });
    mockUsePermissions.mockReturnValue({ can: vi.fn().mockReturnValue(true) });

    renderRoute(<span>Roles Page</span>, 'view_roles');
    expect(screen.getByText('Roles Page')).toBeInTheDocument();
  });

  it('redirects to fallback when user lacks required permission', () => {
    localStorage.setItem('access_token', 'token-123');
    mockUseUserQuery.mockReturnValue({ data: { id: 'u1' }, isLoading: false });
    mockUsePermissions.mockReturnValue({ can: vi.fn().mockReturnValue(false) });

    renderRoute(<span>Roles Page</span>, 'view_roles', '/home');
    expect(screen.queryByText('Roles Page')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/home');
  });

  it('does not redirect when user data is undefined (permission guard skipped)', () => {
    localStorage.setItem('access_token', 'token-123');
    mockUseUserQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUsePermissions.mockReturnValue({ can: vi.fn().mockReturnValue(false) });

    renderRoute(<span>Protected Content</span>, 'view_roles');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
