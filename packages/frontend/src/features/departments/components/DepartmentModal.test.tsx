import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'es' } }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useCreateDepartmentMutation: vi.fn(),
    useUpdateDepartmentMutation: vi.fn(),
  };
});

vi.mock('../../../components/ui/FormModal', () => ({
  FormModal: ({ isOpen, title, children, onSubmit, submitLabel, isPending, isValid, onClose }: any) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit" disabled={isPending || !isValid}>
            {submitLabel}
          </button>
          <button type="button" onClick={onClose}>cancel</button>
        </form>
      </div>
    ) : null,
}));

import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from '@ticket-registrator/shared';
import { DepartmentModal } from './DepartmentModal';

describe('DepartmentModal', () => {
  let createMutate: ReturnType<typeof vi.fn>;
  let updateMutate: ReturnType<typeof vi.fn>;
  let createOnSuccess: (() => void) | undefined;
  let updateOnSuccess: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    createMutate = vi.fn();
    updateMutate = vi.fn();
    createOnSuccess = undefined;
    updateOnSuccess = undefined;
    (useCreateDepartmentMutation as ReturnType<typeof vi.fn>).mockImplementation(
      (_companyId: string, opts: any) => {
        createOnSuccess = opts?.onSuccess;
        return { mutate: createMutate, isPending: false };
      },
    );
    (useUpdateDepartmentMutation as ReturnType<typeof vi.fn>).mockImplementation(
      (_companyId: string, opts: any) => {
        updateOnSuccess = opts?.onSuccess;
        return { mutate: updateMutate, isPending: false };
      },
    );
  });

  const renderModal = (overrides: Partial<React.ComponentProps<typeof DepartmentModal>> = {}) => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      companyId: 'c1',
      ...overrides,
    };
    return { props, ...render(<DepartmentModal {...props} />) };
  };

  it('renders the create title when no department is given', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'departments.createDepartment' })).toBeInTheDocument();
  });

  it('renders the edit title when a department is given', () => {
    renderModal({ department: { id: 'd1', name: 'Engineering' } as any });
    expect(screen.getByRole('heading', { name: 'departments.editDepartment' })).toBeInTheDocument();
  });

  it('does not render when isOpen=false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables the submit button when name is empty', () => {
    renderModal();
    const submit = screen.getByRole('button', { name: 'departments.createDepartment' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('enables the submit button when name has a value', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('departments.namePlaceholder'), {
      target: { value: 'Sales' },
    });
    const submit = screen.getByRole('button', { name: 'departments.createDepartment' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
  });

  it('pre-fills the input with the department name when editing', () => {
    renderModal({ department: { id: 'd1', name: 'Marketing' } as any });
    expect(screen.getByDisplayValue('Marketing')).toBeInTheDocument();
  });

  it('calls createMutation.mutate with the trimmed name on submit (create)', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('departments.namePlaceholder'), {
      target: { value: 'Sales' },
    });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(createMutate).toHaveBeenCalledWith({ name: 'Sales' });
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('calls updateMutation.mutate with id and data on submit (edit)', () => {
    renderModal({ department: { id: 'd1', name: 'Engineering' } as any });
    fireEvent.change(screen.getByDisplayValue('Engineering'), {
      target: { value: 'Eng' },
    });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(updateMutate).toHaveBeenCalledWith({ id: 'd1', data: { name: 'Eng' } });
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('does not submit when name is whitespace-only', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('departments.namePlaceholder'), {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('calls onClose on create success', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    createOnSuccess?.();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on update success', () => {
    const onClose = vi.fn();
    renderModal({ onClose, department: { id: 'd1', name: 'Eng' } as any });
    updateOnSuccess?.();
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the submit button while pending', () => {
    (useCreateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('departments.namePlaceholder'), {
      target: { value: 'Sales' },
    });
    const submit = screen.getByRole('button', { name: 'departments.createDepartment' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });
});
