import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useCreateUserMutation: vi.fn(),
  };
});

vi.mock('../../roles/components/RoleSelect', () => ({
  RoleSelect: ({ value, onChange, placeholder, required }: any) => (
    <select aria-label="Rol" value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      <option value="r1">Admin</option>
      <option value="r2">Empleado</option>
    </select>
  ),
}));

vi.mock('../../organizations/components/OrgSelect', () => ({
  OrgSelect: ({ label, value, onChange }: any) => (
    <select aria-label={label} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">Seleccionar org</option>
      <option value="o1">Org 1</option>
    </select>
  ),
}));

vi.mock('../../departments/components/DepartmentMultiSelect', () => ({
  DepartmentMultiSelect: () => <div data-testid="dept-multi-select" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'users.fieldName': 'Nombre',
        'users.fieldSurname': 'Apellido',
        'users.fieldEmail': 'Email',
        'users.fieldUsername': 'Username',
        'users.fieldPassword': 'Contraseña',
        'users.fieldConfirmPassword': 'Confirmar contraseña',
        'users.passwordMismatch': 'Las contraseñas no coinciden.',
        'users.create': 'Crear usuario',
        'users.createUserBtn': 'Crear usuario',
        'users.fieldRole': 'Rol',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'es' },
  }),
}));

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

import { useCreateUserMutation } from '@ticket-registrator/shared';
import { CreateUserModal } from './CreateUserModal';

const mockMutate = vi.fn();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('renders without crashing', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders form fields (Nombre, Apellido, Email, Username, Contraseña, Confirmar contraseña)', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Username *')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña *')).toBeInTheDocument();
  });

  it('renders RoleSelect for role selection', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    const select = screen.getByRole('combobox', { name: /rol/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Empleado')).toBeInTheDocument();
  });

  it('shows password mismatch warning when passwords differ', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    fireEvent.change(screen.getByLabelText('Contraseña *'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña *'), {
      target: { value: 'password2' },
    });
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('hides password mismatch warning when passwords match', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    fireEvent.change(screen.getByLabelText('Contraseña *'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña *'), {
      target: { value: 'password1' },
    });
    expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument();
  });

  it('submit button is disabled when form is incomplete', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );
    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when all fields are valid', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Apellido *'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@example.com' } });
    fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'cgarcia' } });
    fireEvent.change(screen.getByLabelText('Contraseña *'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña *'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'r1' } });

    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls mutation.mutate with correct payload on submit', () => {
    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Apellido *'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@example.com' } });
    fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'cgarcia' } });
    fireEvent.change(screen.getByLabelText('Contraseña *'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña *'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByRole('combobox', { name: /rol/i }), { target: { value: 'r1' } });

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      name: 'Carlos',
      surname: 'García',
      email: 'carlos@example.com',
      username: 'cgarcia',
      password: 'password123',
      confirmPassword: 'password123',
      roleId: 'r1',
      departmentIds: [],
    });
  });

  it('shows AlertError when mutation has error', () => {
    (useCreateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: { response: { data: { message: 'El email ya está en uso.' } } },
    });

    render(
      <CreateUserModal isOpen={true} onClose={vi.fn()} companyId="c1" />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('El email ya está en uso.')).toBeInTheDocument();
  });
});
