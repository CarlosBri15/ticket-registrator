import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useRolesQuery: vi.fn(),
    useCreateRoleMutation: vi.fn(),
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

vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, ...props }: { label: string; [key: string]: unknown }) => (
    <input aria-label={label} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
  ),
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

vi.mock('../../../components/ui/Alert', () => ({
  AlertError: ({ message }: { message: string }) => <div role="alert">{message}</div>,
  getApiErrorMessage: (error: unknown) => {
    const data = (error as { response?: { data?: { message?: string } } })?.response?.data;
    if (!data) return 'Error inesperado. Inténtalo de nuevo.';
    if (typeof data.message === 'string') return data.message;
    return 'Error inesperado. Inténtalo de nuevo.';
  },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { useRolesQuery, useCreateRoleMutation } from '@ticket-registrator/shared';
import { CreateRoleModal } from './CreateRoleModal';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleRoles = [
  { id: 'r1', name: 'Admin', hierarchy: 99, description: null, companyId: 'c1' },
  { id: 'r2', name: 'Empleado', hierarchy: 10, description: null, companyId: 'c1' },
];

const mockMutate = vi.fn();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateRoleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: sampleRoles,
      isLoading: false,
    });

    (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('renders without crashing', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows existing roles in hierarchy reference section', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Empleado')).toBeInTheDocument();
  });

  it('shows hierarchy badge text for each existing role', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    // Badges are formatted as "Label (hierarchy)"
    expect(screen.getByText('Admin (99)')).toBeInTheDocument();
    expect(screen.getByText('Empleado (10)')).toBeInTheDocument();
  });

  it('shows "Sin roles aún" when no existing roles', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    expect(screen.getByText('Sin roles aún')).toBeInTheDocument();
  });

  it('shows live hierarchy label when user types a hierarchy value of 50 → Manager', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    const hierarchyInput = screen.getByLabelText('Jerarquía (1–99) *');
    fireEvent.change(hierarchyInput, { target: { value: '50' } });
    expect(screen.getByText('→ Manager')).toBeInTheDocument();
  });

  it('shows live hierarchy label for 99 → Admin', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    const hierarchyInput = screen.getByLabelText('Jerarquía (1–99) *');
    fireEvent.change(hierarchyInput, { target: { value: '99' } });
    expect(screen.getByText('→ Admin')).toBeInTheDocument();
  });

  it('shows live hierarchy label for 10 → Empleado', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    const hierarchyInput = screen.getByLabelText('Jerarquía (1–99) *');
    fireEvent.change(hierarchyInput, { target: { value: '10' } });
    expect(screen.getByText('→ Empleado')).toBeInTheDocument();
  });

  it('submit button is disabled when name is empty', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    // Name is empty by default
    const submitButton = screen.getByRole('button', { name: /crear rol/i });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when name is filled and hierarchy is valid (1-99)', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    fireEvent.change(screen.getByLabelText('Nombre del rol *'), {
      target: { value: 'Supervisor' },
    });
    fireEvent.change(screen.getByLabelText('Jerarquía (1–99) *'), {
      target: { value: '30' },
    });

    const submitButton = screen.getByRole('button', { name: /crear rol/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls createRoleMutation.mutate with correct payload', () => {
    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    fireEvent.change(screen.getByLabelText('Nombre del rol *'), {
      target: { value: 'Supervisor' },
    });
    fireEvent.change(screen.getByLabelText('Jerarquía (1–99) *'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Supervisa el área' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear rol/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      name: 'Supervisor',
      hierarchy: 30,
      description: 'Supervisa el área',
    });
  });

  it('calls onRoleCreated with new role id on success', () => {
    const onRoleCreated = vi.fn();
    const onClose = vi.fn();

    (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockImplementation(
      (_companyId: string, options?: { onSuccess?: (data: { id: string; name: string; hierarchy: number }) => void }) => ({
        mutate: vi.fn((data: { name: string; hierarchy: number }) =>
          options?.onSuccess?.({ id: 'new-role-id', ...data })
        ),
        isPending: false,
        error: null,
      })
    );

    render(
      <CreateRoleModal
        isOpen={true}
        onClose={onClose}
        companyId="c1"
        onRoleCreated={onRoleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('Nombre del rol *'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Jerarquía (1–99) *'), {
      target: { value: '50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear rol/i }));

    expect(onRoleCreated).toHaveBeenCalledWith('new-role-id');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows AlertError when mutation has error', () => {
    (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: { response: { data: { message: 'El nombre ya está en uso.' } } },
    });

    render(
      <CreateRoleModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('El nombre ya está en uso.')).toBeInTheDocument();
  });
});
