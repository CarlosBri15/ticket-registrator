import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsersScreen } from './UsersScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useUsersQuery: vi.fn(),
  useCreateUserMutation: vi.fn(),
  useDeleteUserMutation: vi.fn(),
  useRolesQuery: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Users: () => null,
  Search: () => null,
  Plus: () => null,
  Trash2: () => null,
  UserCircle: () => null,
  Mail: () => null,
  AtSign: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));
vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

import {
  useUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useRolesQuery,
  usePermissions,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ scope: 'company' });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ selectedCompanyId: 'company-1' });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <UsersScreen />
    </MemoryRouter>,
  );

describe('UsersScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders the Usuarios heading', () => {
    renderScreen();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderScreen();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    renderScreen();
    expect(screen.getByText(/no hay usuarios/i)).toBeInTheDocument();
  });

  it('renders create user button when user has permission', () => {
    renderScreen();
    expect(screen.getByText(/nuevo usuario/i)).toBeInTheDocument();
  });

  it('does not render create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByText(/nuevo usuario/i)).not.toBeInTheDocument();
  });

  it('renders user list when users exist', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'u1', name: 'Ana García', email: 'ana@test.com', username: 'ana.garcia', roleName: 'Admin' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });
});
