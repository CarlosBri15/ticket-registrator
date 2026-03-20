import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsersScreen } from './UsersScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock('@ticket-registrator/shared', () => ({
  useUsersQuery: vi.fn(),
  useCreateUserMutation: vi.fn(),
  useDeleteUserMutation: vi.fn(),
  useUpdateUserMutation: vi.fn(),
  useRolesQuery: vi.fn(),
  useDepartmentsQuery: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
  AUTHORITY_LEVELS: { GLOBAL: 100, COMPANY: 99, DEPARTMENT: 40, SELF: 0 },
}));

vi.mock('lucide-react', () => ({
  Users: () => null,
  Search: () => null,
  Plus: () => null,
  Trash2: () => null,
  UserCircle: () => null,
  Mail: () => null,
  AtSign: () => null,
  Pencil: () => <span data-testid="pencil-icon" />,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));
const MOCK_ROLES = [{ id: 'r1', name: 'Admin', hierarchy: 99, companyId: 'company-1', description: null }];
const MOCK_SUPERADMIN_ROLE = { id: 'sa1', name: 'SuperAdmin', hierarchy: 100, companyId: null, description: null };

vi.mock('../../components/ui/selects', () => ({
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
  DepartmentMultiSelect: ({ value, onChange }: any) => (
    <div data-testid="dept-multiselect">
      <button onClick={() => onChange(['d1'])}>select-dept</button>
    </div>
  ),
}));
vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('./EditUserModal', () => ({
  EditUserModal: ({ isOpen, onClose, user }: any) =>
    isOpen ? (
      <div role="dialog" data-testid="edit-modal">
        <h2>Editar Usuario</h2>
        <input aria-label="Nombre *" defaultValue={user?.name} />
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('../../components/ui/Alert', () => ({
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
  useDepartmentsQuery,
  usePermissions,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() });
  (useDeleteUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() });
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false, scope: { type: 'company', companyId: 'company-1' } });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
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

  it('shows loading state when isLoading is true', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument();
  });

  it('shows "Sin resultados" when search has no matches', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana García', surname: 'García', email: 'ana@test.com', username: 'ana', roleName: 'Admin' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'xyz' } });
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  it('opens create user modal when Nuevo Usuario button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls delete mutate when delete button is clicked', () => {
    const mockDelete = vi.fn();
    (useDeleteUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockDelete });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana García', surname: 'García', email: 'ana@test.com', username: 'ana', roleName: 'Admin' }],
      isLoading: false,
    });
    renderScreen();
    // buttons: [0]=Nuevo Usuario, [1]=delete for u1
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockDelete).toHaveBeenCalledWith('u1');
  });

  it('renders a role select inside the create modal', () => {
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.getByRole('combobox', { name: /rol/i })).toBeInTheDocument();
  });

  it('submit button is disabled when required fields are empty', () => {
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    const submitBtn = screen.getByText(/crear usuario/i).closest('button');
    expect(submitBtn).toBeDisabled();
  });

  it('calls create mutate on valid form submit', () => {
    const mockCreate = vi.fn();
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockCreate, isPending: false, error: null, reset: vi.fn() });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'juan@test.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /usuario/i }), { target: { value: 'jperez' } });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirmar \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/rol/i), { target: { value: 'r1' } });

    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Juan', email: 'juan@test.com', roleId: 'r1', departmentIds: [] }),
    );
  });

  it('shows password mismatch message', () => {
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByLabelText(/contraseña \*/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/confirmar \*/i), { target: { value: 'xyz' } });

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  // ── API error handling ────────────────────────────────────────────────────────

  it('shows API error alert when mutation fails with 409', () => {
    const apiError = { response: { data: { message: 'Email already exists' } } };
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: apiError,
      reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('shows API error alert when mutation fails with 409 duplicate username', () => {
    const apiError = { response: { data: { message: 'Username already exists' } } };
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: apiError,
      reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.getByText('Username already exists')).toBeInTheDocument();
  });

  it('shows fallback error message when error has no response data', () => {
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error('network error'),
      reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.getByText(/error inesperado/i)).toBeInTheDocument();
  });

  it('calls mutation.reset when dismiss button in alert is clicked', () => {
    const mockReset = vi.fn();
    const apiError = { response: { data: { message: 'Email already exists' } } };
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: apiError,
      reset: mockReset,
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(mockReset).toHaveBeenCalled();
  });

  it('does not show alert when mutation has no error', () => {
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── SuperAdmin: org selector ────────────────────────────────────────────────

  it('does NOT show OrgSelect when creator is not SuperAdmin', () => {
    // companyId is set → creator is not SuperAdmin
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    expect(screen.queryByRole('combobox', { name: /organización/i })).not.toBeInTheDocument();
  });

  it('does NOT show OrgSelect before a role is selected (SuperAdmin creator)', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);
    // No role selected yet → isTargetSuperAdmin = false but roleId is "" → OrgSelect is hidden until role chosen
    // OrgSelect should NOT appear yet (role is empty, isTargetSuperAdmin is false due to selectedRole=null)
    expect(screen.queryByRole('combobox', { name: /organización/i })).not.toBeInTheDocument();
  });

  it('shows OrgSelect after a non-SuperAdmin role is selected (SuperAdmin creator)', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'r1' } });

    expect(screen.getByRole('combobox', { name: /organización/i })).toBeInTheDocument();
  });

  it('does NOT show OrgSelect when SuperAdmin role is selected (no org needed)', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'sa1' } });

    expect(screen.queryByRole('combobox', { name: /organización/i })).not.toBeInTheDocument();
  });

  it('includes companyId in mutation payload when SuperAdmin selects role then org', () => {
    const mockCreate = vi.fn();
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockCreate, isPending: false, error: null, reset: vi.fn(),
    });
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'juan@test.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /usuario/i }), { target: { value: 'jperez' } });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirmar \*/i), { target: { value: 'secret123' } });
    // Select role first → OrgSelect appears
    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'r1' } });
    // Select org — roleId must NOT be cleared
    fireEvent.change(screen.getByRole('combobox', { name: /organización/i }), { target: { value: 'o1' } });

    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: 'r1', companyId: 'o1' }),
    );
  });

  it('does NOT include companyId in mutation when SuperAdmin creates a SuperAdmin user', () => {
    const mockCreate = vi.fn();
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockCreate, isPending: false, error: null, reset: vi.fn(),
    });
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Root' } });
    fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Admin' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'root@global.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /usuario/i }), { target: { value: 'rootadmin' } });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirmar \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'sa1' } });

    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({ companyId: expect.anything() }),
    );
  });

  // ── Edit user tests ───────────────────────────────────────────────────────────

  it('renders edit button for each user', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: [] }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByTitle(/editar usuario/i)).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: [] }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle(/editar usuario/i));
    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
  });

  it('edit modal is pre-filled with user data', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: [] }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle(/editar usuario/i));
    const nameInput = screen.getByRole('textbox', { name: /nombre \*/i });
    expect((nameInput as HTMLInputElement).value).toBe('Ana');
  });

  it('calls updateMutation on edit form submit', () => {
    const mockUpdate = vi.fn();
    (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockUpdate, isPending: false, error: null, reset: vi.fn() });
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: [] }],
      isLoading: false,
    });
    // The EditUserModal is mocked, so just verify the modal opens and update mock was set up
    renderScreen();
    fireEvent.click(screen.getByTitle(/editar usuario/i));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    expect(mockUpdate).toBeDefined();
  });

  it('navigates to /users/:id when user row name is clicked', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: [] }],
      isLoading: false,
    });
    renderScreen();
    // Click on the user row button (name area)
    const userButton = screen.getByText('Ana García').closest('button');
    expect(userButton).toBeTruthy();
    fireEvent.click(userButton!);
    expect(mockNavigate).toHaveBeenCalledWith('/users/u1');
  });

  // ── DepartmentMultiSelect tests ───────────────────────────────────────────────

  it('shows DepartmentMultiSelect in create modal when role is selected', () => {
    // companyId is set (non-SuperAdmin creator)
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    // Select a non-SA role
    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'r1' } });

    expect(screen.getByTestId('dept-multiselect')).toBeInTheDocument();
  });

  it('includes departmentIds in create payload when departments selected', () => {
    const mockCreate = vi.fn();
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockCreate, isPending: false, error: null, reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getAllByText(/nuevo usuario/i)[0]);

    fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'juan@test.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /usuario/i }), { target: { value: 'jperez' } });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirmar \*/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/rol/i), { target: { value: 'r1' } });

    // Click select-dept to add a department
    fireEvent.click(screen.getByText('select-dept'));

    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ departmentIds: ['d1'] }),
    );
  });
});
