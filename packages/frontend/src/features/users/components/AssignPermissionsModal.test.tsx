import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useAllPermissionsQuery: vi.fn(),
    useRolePermissionsQuery: vi.fn(),
    useAssignPermissionMutation: vi.fn(),
    useUnassignPermissionMutation: vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
  XCircle: () => <span data-testid="icon-xcircle" />,
  CheckCircle2: () => <span data-testid="icon-checkcircle2" />,
  AlertTriangle: () => <span data-testid="icon-alerttriangle" />,
  Info: () => <span data-testid="icon-info" />,
  X: () => <span data-testid="icon-x" />,
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title, subtitle }: { isOpen: boolean; children: React.ReactNode; title: string; subtitle?: string }) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    ) : null,
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    type?: string;
  }) => (
    <button type={type as 'button' | 'submit' | 'reset' | undefined} onClick={onClick} disabled={disabled || isLoading}>
      {children}
    </button>
  ),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import {
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
} from '@ticket-registrator/shared';
import { AssignPermissionsModal } from './AssignPermissionsModal';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const allPerms = [
  { id: 'p1', name: 'create_users', description: 'Crear usuarios', deletedAt: null, createdAt: now, updatedAt: now },
  { id: 'p2', name: 'view_users', description: 'Ver usuarios', deletedAt: null, createdAt: now, updatedAt: now },
  { id: 'p3', name: 'create_reports', description: 'Crear reportes', deletedAt: null, createdAt: now, updatedAt: now },
];

const assignedPerms = [allPerms[0]]; // only p1 (create_users) assigned

const mockAssignMutate = vi.fn();
const mockUnassignMutate = vi.fn();

// ─── Default props ────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  companyId: 'c1',
  roleId: 'r1',
  roleName: 'Admin',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AssignPermissionsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAllPermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: allPerms,
      isLoading: false,
    });

    (useRolePermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: assignedPerms,
      isLoading: false,
    });

    (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockAssignMutate,
      mutateAsync: mockAssignMutate,
      isPending: false,
    });

    (useUnassignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockUnassignMutate,
      mutateAsync: mockUnassignMutate,
      isPending: false,
    });
  });

  it('renders without crashing', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows loading state when permissions are loading', () => {
    (useAllPermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useRolePermissionsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<AssignPermissionsModal {...defaultProps} />);
    expect(screen.getByLabelText('Cargando permisos')).toBeInTheDocument();
  });

  it('shows permission names as checkboxes', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    expect(screen.getByLabelText('create_users')).toBeInTheDocument();
    expect(screen.getByLabelText('view_users')).toBeInTheDocument();
    expect(screen.getByLabelText('create_reports')).toBeInTheDocument();
  });

  it('shows permissions grouped by resource', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    // Groups are extracted from permission name: 'create_users' → 'users', 'create_reports' → 'reports'
    // The group headers use capitalizeFirst which capitalizes the first letter
    // CSS uppercase does NOT change textContent, so we search for the actual text content
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('pre-checks permissions that are already assigned', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    // p1 (create_users) is assigned
    const createUsersCheckbox = screen.getByLabelText('create_users') as HTMLInputElement;
    expect(createUsersCheckbox.checked).toBe(true);
  });

  it('does NOT pre-check unassigned permissions', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    // p2 (view_users) and p3 (create_reports) are NOT assigned
    const viewUsersCheckbox = screen.getByLabelText('view_users') as HTMLInputElement;
    const createReportsCheckbox = screen.getByLabelText('create_reports') as HTMLInputElement;
    expect(viewUsersCheckbox.checked).toBe(false);
    expect(createReportsCheckbox.checked).toBe(false);
  });

  it('shows count "1 de 3 permisos seleccionados"', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    expect(
      screen.getByText((_, el) => el?.textContent === '1 de 3 permisos seleccionados'),
    ).toBeInTheDocument();
  });

  it('toggling an unchecked permission marks it as checked locally (no mutation yet)', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    const viewUsersCheckbox = screen.getByLabelText('view_users') as HTMLInputElement;
    expect(viewUsersCheckbox.checked).toBe(false);

    fireEvent.click(viewUsersCheckbox);
    expect(viewUsersCheckbox.checked).toBe(true);

    // No mutation should have been called yet
    expect(mockAssignMutate).not.toHaveBeenCalled();
    expect(mockUnassignMutate).not.toHaveBeenCalled();
  });

  it('toggling a checked permission marks it as unchecked locally', () => {
    render(<AssignPermissionsModal {...defaultProps} />);
    const createUsersCheckbox = screen.getByLabelText('create_users') as HTMLInputElement;
    expect(createUsersCheckbox.checked).toBe(true);

    fireEvent.click(createUsersCheckbox);
    expect(createUsersCheckbox.checked).toBe(false);

    // No mutation called yet
    expect(mockAssignMutate).not.toHaveBeenCalled();
    expect(mockUnassignMutate).not.toHaveBeenCalled();
  });

  it('clicking "Guardar cambios" calls assignPermission for newly checked permissions', () => {
    // Setup mutate to call onSuccess immediately
    (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
    (useUnassignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    render(<AssignPermissionsModal {...defaultProps} />);

    // Toggle p2 (view_users) to checked — it was unchecked
    fireEvent.click(screen.getByLabelText('view_users'));

    // Click save
    fireEvent.click(screen.getByText('Guardar cambios'));

    const assignMutateAsyncMock = (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mock.results[0].value.mutateAsync;
    expect(assignMutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: 'r1', permissionId: 'p2', companyId: 'c1' })
    );
  });

  it('clicking "Guardar cambios" calls unassignPermission for unchecked permissions that were previously assigned', () => {
    // Setup mutate to call onSuccess immediately
    (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
    (useUnassignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    render(<AssignPermissionsModal {...defaultProps} />);

    // Toggle p1 (create_users) to unchecked — it was checked (assigned)
    fireEvent.click(screen.getByLabelText('create_users'));

    // Click save
    fireEvent.click(screen.getByText('Guardar cambios'));

    const unassignMutateAsyncMock = (useUnassignPermissionMutation as ReturnType<typeof vi.fn>).mock.results[0].value.mutateAsync;
    expect(unassignMutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: 'r1', permissionId: 'p1', companyId: 'c1' })
    );
  });

  it('"Guardar cambios" button is disabled while mutations are pending', () => {
    (useAssignPermissionMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockAssignMutate,
      mutateAsync: mockAssignMutate,
      isPending: true,
    });

    render(<AssignPermissionsModal {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    expect(saveButton).toBeDisabled();
  });
});
