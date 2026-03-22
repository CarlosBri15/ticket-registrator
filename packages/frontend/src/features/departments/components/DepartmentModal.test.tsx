import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', () => ({
  useCreateDepartmentMutation: vi.fn(),
  useUpdateDepartmentMutation: vi.fn(),
}));

vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, type, ...rest }: any) => (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} data-loading={isLoading} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, value, onChange, ...rest }: any) => (
    <div>
      <label>{label}</label>
      <input value={value} onChange={onChange} aria-label={label} {...rest} />
    </div>
  ),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '@ticket-registrator/shared';
import { DepartmentModal } from './DepartmentModal';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const createMutateMock = vi.fn();
const updateMutateMock = vi.fn();

const setupMocks = () => {
  (useCreateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: createMutateMock,
    isPending: false,
  });
  (useUpdateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: updateMutateMock,
    isPending: false,
  });
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  companyId: 'company-1',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DepartmentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders "Nuevo Departamento" title when no department prop', () => {
    render(<DepartmentModal {...defaultProps} />);
    expect(screen.getByText('Nuevo Departamento')).toBeInTheDocument();
  });

  it('renders "Editar Departamento" title when department prop passed', () => {
    const dept = { id: 'dept-1', name: 'Engineering', companyId: 'company-1' };
    render(<DepartmentModal {...defaultProps} department={dept as any} />);
    expect(screen.getByText('Editar Departamento')).toBeInTheDocument();
  });

  it('pre-fills name input when editing', () => {
    const dept = { id: 'dept-1', name: 'Engineering', companyId: 'company-1' };
    render(<DepartmentModal {...defaultProps} department={dept as any} />);
    const input = screen.getByDisplayValue('Engineering');
    expect(input).toBeInTheDocument();
  });

  it('calls createMutation.mutate on submit in create mode', () => {
    render(<DepartmentModal {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Dept' } });
    const form = screen.getByTestId('modal').querySelector('form')!;
    fireEvent.submit(form);
    expect(createMutateMock).toHaveBeenCalledWith({ name: 'New Dept' });
  });

  it('calls updateMutation.mutate on submit in edit mode', () => {
    const dept = { id: 'dept-1', name: 'Engineering', companyId: 'company-1' };
    render(<DepartmentModal {...defaultProps} department={dept as any} />);
    const input = screen.getByDisplayValue('Engineering');
    fireEvent.change(input, { target: { value: 'Updated Engineering' } });
    const form = screen.getByTestId('modal').querySelector('form')!;
    fireEvent.submit(form);
    expect(updateMutateMock).toHaveBeenCalledWith({
      id: 'dept-1',
      data: { name: 'Updated Engineering' },
    });
  });

  it('submit button is disabled when name is empty', () => {
    render(<DepartmentModal {...defaultProps} />);
    const submitBtn = screen.getByText('Crear Departamento');
    expect(submitBtn).toBeDisabled();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<DepartmentModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state on submit button when isPending', () => {
    (useCreateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: createMutateMock,
      isPending: true,
    });
    render(<DepartmentModal {...defaultProps} />);
    const submitBtn = screen.getByText('Crear Departamento');
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('data-loading', 'true');
  });
});
