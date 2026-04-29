import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsersScreen } from './UsersScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUsersQuery: vi.fn(),
    useCreateUserMutation: vi.fn(),
    useDeleteUserMutation: vi.fn(),
    useUpdateUserMutation: vi.fn(),
    useRolesQuery: vi.fn(),
    useSystemRolesQuery: vi.fn(),
    useDepartmentsQuery: vi.fn(),
    usePermissions: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
    useCompanyScope: vi.fn(),
  };
});

const MOCK_ROLES = [{ id: 'r1', name: 'Admin', hierarchy: 99, companyId: 'company-1', description: null }];
const MOCK_SUPERADMIN_ROLE = { id: 'sa1', name: 'SuperAdmin', hierarchy: 100, companyId: null, description: null };

vi.mock('../../roles/components/RoleSelect', () => ({
  RoleSelect: ({ value, onChange, placeholder, required, id }: any) => (
    <select
      aria-label="Rol"
      id={id ?? 'user-role'}
      value={value ?? ''}
      onChange={(e) => {
        const role = e.target.value === 'sa1' ? MOCK_SUPERADMIN_ROLE : MOCK_ROLES.find(r => r.id === e.target.value);
        onChange?.(e.target.value, role);
      }}
      required={required}
    >
      {placeholder && <option value="">{placeholder}</option>}
      <option value="r1">Admin</option>
      <option value="sa1">SuperAdmin</option>
    </select>
  ),
}));

vi.mock('../../organizations/components/OrgSelect', () => ({
  OrgSelect: ({ value, onChange, placeholder, required, id }: any) => (
    <select
      aria-label="Organización"
      id={id ?? 'user-org'}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
    >
      {placeholder && <option value="">{placeholder}</option>}
      <option value="o1">Acme Corp</option>
    </select>
  ),
}));

vi.mock('../../departments/components/DepartmentMultiSelect', () => ({
  DepartmentMultiSelect: ({ onChange }: any) => (
    <div data-testid="dept-multiselect">
      <button onClick={() => onChange(['d1'])}>select-dept</button>
    </div>
  ),
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('../components/EditUserModal', () => ({
  EditUserModal: ({ isOpen, onClose, user }: any) =>
    isOpen ? (
      <div role="dialog" data-testid="edit-modal">
        <h2>Editar Usuario</h2>
        <input aria-label="Nombre *" defaultValue={user?.name} />
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('../../../components/ui/Alert', () => ({
  AlertError: ({ message, onDismiss }: any) => (
    <div role="alert">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} aria-label="Cerrar">×</button>}
    </div>
  ),
  getApiErrorMessage: (error: any) => error?.response?.data?.message ?? 'Error inesperado. Inténtalo de nuevo.',
}));

import {
  useUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useRolesQuery,
  useSystemRolesQuery,
  useDepartmentsQuery,
  usePermissions,
  useScope,
  useScopeContext,
  useCompanyScope,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() });
  (useDeleteUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() });
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_ROLES });
  (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [MOCK_SUPERADMIN_ROLE] });
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false, scope: { type: 'company', companyId: 'company-1' } });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
  (useCompanyScope as ReturnType<typeof vi.fn>).mockReturnValue({ companyId: 'company-1' });
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
    mockNavigate.mockReset();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders the Usuarios heading', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('users.title');
  });

  it('renders search input when there are users', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByPlaceholderText('users.searchPlaceholder')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    renderScreen();
    expect(screen.getByText('users.empty')).toBeInTheDocument();
  });

  it('renders create user button when user has permission', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: 'users.newUser' })).toBeInTheDocument();
  });

  it('does not render create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByRole('button', { name: 'users.newUser' })).not.toBeInTheDocument();
  });

  it('renders user list when users exist', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' },
      ],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText(/ana garcía/i)).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText('users.loading')).toBeInTheDocument();
  });

  it('shows "Sin resultados" when search has no matches', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText('users.searchPlaceholder'), { target: { value: 'xyz' } });
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('opens create user modal when Nuevo Usuario button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'users.newUser' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders edit button for each user', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByTitle('users.editUser')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle('users.editUser'));
    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
  });

  it('navigates to /users/:id when user row is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    const rowButton = screen.getByText(/ana garcía/i).closest('button');
    expect(rowButton).toBeTruthy();
    fireEvent.click(rowButton!);
    expect(mockNavigate).toHaveBeenCalledWith('/users/u1');
  });

  it('does not propagate row click when edit button inside row is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle('users.editUser'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders the role pill for each user', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('clears search when "X" button inside the search input is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1' }],
      isLoading: false,
    });
    renderScreen();
    const searchInput = screen.getByPlaceholderText('users.searchPlaceholder') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    expect(screen.getByText('common.noResults')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(searchInput.value).toBe('');
  });
});
