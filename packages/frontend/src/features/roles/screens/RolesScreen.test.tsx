import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RolesScreen } from './RolesScreen';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useRolesQuery: vi.fn(),
    useSystemRolesQuery: vi.fn(),
    useCreateRoleMutation: vi.fn(),
    useDeleteRoleMutation: vi.fn(),
    usePermissions: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
    useCompanyScope: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('../components/CreateRoleModal', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    CreateRoleModal: ({ isOpen, onClose }: any) =>
      isOpen ? (
        <div role="dialog">
          <h2>Crear Rol</h2>
          <button onClick={onClose}>Cerrar</button>
        </div>
      ) : null,
  };
});

import {
  useRolesQuery,
  useSystemRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  usePermissions,
  useScope,
  useScopeContext,
  useCompanyScope,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
  (useCompanyScope as ReturnType<typeof vi.fn>).mockReturnValue({ companyId: 'company-1', isGlobal: false });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <RolesScreen />
    </MemoryRouter>,
  );

describe('RolesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Roles heading', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/roles/i);
  });

  it('renders create role button when user has permission', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /nuevo rol/i })).toBeInTheDocument();
  });

  it('does not show create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByRole('button', { name: /nuevo rol/i })).not.toBeInTheDocument();
  });

  it('shows empty state when no roles', () => {
    renderScreen();
    expect(screen.getByText('roles.empty')).toBeInTheDocument();
  });

  it('renders role list when roles exist', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Supervisor', hierarchy: 3, description: 'Supervisa el equipo' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
  });

  it('shows org-selection placeholder when companyId is null and not global', () => {
    (useCompanyScope as ReturnType<typeof vi.fn>).mockReturnValue({ companyId: null, isGlobal: false });
    renderScreen();
    expect(screen.getByText(/selecciona una organización/i)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText(/cargando roles/i)).toBeInTheDocument();
  });

  it('opens create modal when Nuevo Rol button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /nuevo rol/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls delete mutate when delete button is clicked', () => {
    const mockDelete = vi.fn();
    (useDeleteRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockDelete });
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Supervisor', hierarchy: 3 }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle('Eliminar'));
    expect(mockDelete).toHaveBeenCalledWith('r1');
  });
});
