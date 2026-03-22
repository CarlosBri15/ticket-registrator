import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUpdateUserMutation: vi.fn(),
    useRolesQuery: vi.fn(),
    useSystemRolesQuery: vi.fn(),
  };
});

vi.mock('../../roles/components/RoleSelect', () => ({
  RoleSelect: ({ value, onChange, id, required }: any) => (
    <div data-testid="role-select">
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        aria-label="RoleSelect"
      >
        <option value="">Select role</option>
        <option value="role-1">Admin</option>
        <option value="role-2">Employee</option>
      </select>
    </div>
  ),
}));

vi.mock('../../departments/components/DepartmentMultiSelect', () => ({
  DepartmentMultiSelect: ({ onChange }: any) => (
    <div data-testid="department-multi-select">
      <button onClick={() => onChange?.(['dept-1'])}>Select Department</button>
    </div>
  ),
}));

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, type, ...rest }: any) => (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} data-loading={isLoading} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, value, onChange, type, ...rest }: any) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        type={type ?? 'text'}
        aria-label={label}
        {...rest}
      />
    </div>
  ),
}));

vi.mock('../../../components/ui/Alert', () => ({
  AlertError: ({ message }: any) => (
    <div role="alert" data-testid="alert-error">
      {message}
    </div>
  ),
  getApiErrorMessage: (error: any) => error?.message ?? 'Unknown error',
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useUpdateUserMutation } from '@ticket-registrator/shared';
import { EditUserModal } from './EditUserModal';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const mutateMock = vi.fn();
const resetMock = vi.fn();

const setupMocks = () => {
  (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mutateMock,
    isPending: false,
    error: null,
    reset: resetMock,
  });
};

const mockUser = {
  id: 'user-1',
  name: 'Carlos',
  surname: 'García',
  email: 'carlos@empresa.com',
  username: 'cgarcia',
  roleId: 'role-1',
  departmentIds: ['dept-1'],
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  user: mockUser as any,
  companyId: 'company-1',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EditUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders "Editar Usuario" title', () => {
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
  });

  it('pre-fills name input with user.name', () => {
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByDisplayValue('Carlos')).toBeInTheDocument();
  });

  it('pre-fills surname with user.surname', () => {
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByDisplayValue('García')).toBeInTheDocument();
  });

  it('pre-fills email with user.email', () => {
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByDisplayValue('carlos@empresa.com')).toBeInTheDocument();
  });

  it('pre-fills username with user.username', () => {
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByDisplayValue('cgarcia')).toBeInTheDocument();
  });

  it('calls updateMutation on submit with correct payload', () => {
    render(<EditUserModal {...defaultProps} />);
    const form = screen.getByTestId('modal').querySelector('form')!;
    fireEvent.submit(form);
    expect(mutateMock).toHaveBeenCalledWith({
      id: 'user-1',
      data: {
        name: 'Carlos',
        surname: 'García',
        email: 'carlos@empresa.com',
        username: 'cgarcia',
        roleId: 'role-1',
        departmentIds: ['dept-1'],
      },
    });
  });

  it('shows error alert when mutation has error', () => {
    (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: { message: 'Something went wrong' },
      reset: resetMock,
    });
    render(<EditUserModal {...defaultProps} />);
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EditUserModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose via mutation onSuccess', () => {
    const onClose = vi.fn();
    (useUpdateUserMutation as ReturnType<typeof vi.fn>).mockImplementation(({ onSuccess }: any) => {
      return {
        mutate: () => onSuccess?.(),
        isPending: false,
        error: null,
        reset: resetMock,
      };
    });
    render(<EditUserModal {...defaultProps} onClose={onClose} />);
    const form = screen.getByTestId('modal').querySelector('form')!;
    fireEvent.submit(form);
    expect(onClose).toHaveBeenCalled();
  });

  it('submit button is disabled when required fields empty', () => {
    const userWithoutName = { ...mockUser, name: '' };
    render(<EditUserModal {...defaultProps} user={userWithoutName as any} />);
    const submitBtn = screen.getByText('Guardar cambios');
    expect(submitBtn).toBeDisabled();
  });

  it('shows DepartmentMultiSelect when companyId is provided', () => {
    render(<EditUserModal {...defaultProps} companyId="company-1" />);
    expect(screen.getByTestId('department-multi-select')).toBeInTheDocument();
  });

  it('does not show DepartmentMultiSelect when companyId is null', () => {
    render(<EditUserModal {...defaultProps} companyId={null} />);
    expect(screen.queryByTestId('department-multi-select')).not.toBeInTheDocument();
  });

  it('calls mutation.reset and updates roleId when RoleSelect onChange is fired', () => {
    render(<EditUserModal {...defaultProps} />);
    const select = screen.getByLabelText('RoleSelect');
    fireEvent.change(select, { target: { value: 'role-2' } });
    expect(resetMock).toHaveBeenCalled();
  });

  it('calls mutation.reset and updates departmentIds when DepartmentMultiSelect onChange is fired', () => {
    render(<EditUserModal {...defaultProps} companyId="company-1" />);
    fireEvent.click(screen.getByText('Select Department'));
    expect(resetMock).toHaveBeenCalled();
  });

  it('calls mutation.reset when a text input changes', () => {
    render(<EditUserModal {...defaultProps} />);
    const nameInput = screen.getByDisplayValue('Carlos');
    fireEvent.change(nameInput, { target: { value: 'Carl' } });
    expect(resetMock).toHaveBeenCalled();
  });
});
