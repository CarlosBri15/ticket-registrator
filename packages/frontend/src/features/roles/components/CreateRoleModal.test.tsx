import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'roles.levelEmployee': 'Empleado',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'es' },
  }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useRolesQuery: vi.fn(),
    useCreateRoleMutation: vi.fn(),
  };
});

vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title, subtitle }: any) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    ) : null,
}));

vi.mock('../../../components/ui/Alert', () => ({
  AlertError: ({ message }: any) => <div role="alert">{message}</div>,
  getApiErrorMessage: () => 'API Error',
}));

import { useRolesQuery, useCreateRoleMutation } from '@ticket-registrator/shared';
import { CreateRoleModal } from './CreateRoleModal';

describe('CreateRoleModal', () => {
  let mutate: ReturnType<typeof vi.fn>;
  let capturedSuccess: ((d: any) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    capturedSuccess = undefined;
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
    (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockImplementation(
      (_companyId: string, opts: any) => {
        capturedSuccess = opts?.onSuccess;
        return { mutate, isPending: false, error: null };
      },
    );
  });

  const renderModal = (overrides: Partial<React.ComponentProps<typeof CreateRoleModal>> = {}) => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      companyId: 'c1',
      ...overrides,
    };
    return { props, ...render(<CreateRoleModal {...props} />) };
  };

  it('renders the modal title and subtitle', () => {
    renderModal();
    expect(screen.getByText('roles.newRole')).toBeInTheDocument();
    expect(screen.getByText('roles.createRoleSubtitle')).toBeInTheDocument();
  });

  it('does not render when isOpen=false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the empty-roles hint when there are no existing roles', () => {
    renderModal();
    expect(screen.getByText('roles.empty')).toBeInTheDocument();
  });

  it('renders existing roles sorted by hierarchy desc', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: 'r1', name: 'Manager', hierarchy: 50 },
        { id: 'r2', name: 'Admin', hierarchy: 99 },
        { id: 'r3', name: 'Worker', hierarchy: 10 },
      ],
    });
    const { container } = renderModal();
    const names = Array.from(container.querySelectorAll('span.truncate'))
      .map((n) => n.textContent)
      .filter((n) => ['Admin', 'Manager', 'Worker'].includes(n ?? ''));
    expect(names).toEqual(['Admin', 'Manager', 'Worker']);
  });

  it('shows the live hierarchy meta label for the typed value', () => {
    renderModal();
    const hierarchyInput = screen.getByDisplayValue('10') as HTMLInputElement;
    fireEvent.change(hierarchyInput, { target: { value: '99' } });
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it('disables the submit button when name is too short', () => {
    renderModal();
    const submit = screen.getByRole('button', { name: 'roles.createRole' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('enables the submit button when name and hierarchy are valid', () => {
    renderModal();
    const nameInput = screen.getByPlaceholderText('roles.namePlaceholder') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Editor' } });
    const submit = screen.getByRole('button', { name: 'roles.createRole' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
  });

  it('calls mutate with the form values on submit', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('roles.namePlaceholder'), { target: { value: 'Editor' } });
    fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('roles.descriptionPlaceholder'), {
      target: { value: 'A handy editor' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'roles.createRole' }));
    expect(mutate).toHaveBeenCalledWith({
      name: 'Editor',
      hierarchy: 20,
      description: 'A handy editor',
    });
  });

  it('omits description from payload when blank', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('roles.namePlaceholder'), { target: { value: 'Editor' } });
    fireEvent.click(screen.getByRole('button', { name: 'roles.createRole' }));
    expect(mutate).toHaveBeenCalledWith({
      name: 'Editor',
      hierarchy: 10,
      description: undefined,
    });
  });

  it('calls onClose and onRoleCreated on mutation success', () => {
    const onClose = vi.fn();
    const onRoleCreated = vi.fn();
    renderModal({ onClose, onRoleCreated });
    capturedSuccess?.({ id: 'new-role-id' });
    expect(onRoleCreated).toHaveBeenCalledWith('new-role-id');
    expect(onClose).toHaveBeenCalled();
  });

  it('fires onClose when the cancel button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders an AlertError when mutation has error', () => {
    (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error('boom'),
    });
    renderModal();
    expect(screen.getByRole('alert')).toHaveTextContent('API Error');
  });
});
