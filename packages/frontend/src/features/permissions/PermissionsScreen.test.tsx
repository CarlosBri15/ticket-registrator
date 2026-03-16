import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PermissionsScreen } from './PermissionsScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useRolesQuery: vi.fn(),
  useSystemRolesQuery: vi.fn(),
  useAllPermissionsQuery: vi.fn(),
  useRolePermissionsQuery: vi.fn(),
  useAssignPermissionMutation: vi.fn(),
  useUnassignPermissionMutation: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Lock: () => null,
  Building2: () => null,
  Shield: () => null,
  Check: () => null,
  Loader2: () => null,
}));

import {
  useRolesQuery,
  useSystemRolesQuery,
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
  usePermissions,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useAllPermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useRolePermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (useUnassignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <PermissionsScreen />
    </MemoryRouter>,
  );

describe('PermissionsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Gestión de Permisos heading', () => {
    renderScreen();
    expect(screen.getByText('Gestión de Permisos')).toBeInTheDocument();
  });

  it('shows "Selecciona un rol" prompt when no role selected', () => {
    renderScreen();
    expect(screen.getByText(/selecciona un rol para ver sus permisos/i)).toBeInTheDocument();
  });

  it('shows "no hay roles" when roles list is empty', () => {
    renderScreen();
    expect(screen.getByText(/no hay roles disponibles/i)).toBeInTheDocument();
  });

  it('renders role list when roles exist', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Manager', companyId: 'c1', hierarchy: 50 }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('shows guard when no companyId and not global', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false, scope: {} });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    expect(screen.getByText(/selecciona una organización/i)).toBeInTheDocument();
  });

  it('shows read-only warning when user cannot manage permissions', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.getByText(/solo puedes ver los permisos/i)).toBeInTheDocument();
  });

  it('uses system roles when no companyId', () => {
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 's1', name: 'SuperAdmin', companyId: null, hierarchy: 100 }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
  });

  it('shows loading spinner when roles are loading', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows role header and permission grid when a role is selected', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Manager', companyId: 'c1', hierarchy: 50 }],
      isLoading: false,
    });
    (useAllPermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'p1', name: 'view_users', description: 'Ver usuarios' }],
      isLoading: false,
    });
    (useRolePermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'p1', name: 'view_users' }],
      isLoading: false,
    });

    renderScreen();
    fireEvent.click(screen.getByText('Manager'));

    expect(screen.getByText('1 permisos asignados')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Ver usuarios')).toBeInTheDocument();
  });
});
