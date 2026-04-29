import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUpdateOrganizationMutation: vi.fn(),
  };
});

import { useUpdateOrganizationMutation } from '@ticket-registrator/shared';
import { OverviewTab } from './OverviewTab';

const baseOrg = {
  id: 'org-1',
  name: 'Acme Inc',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
};

describe('OverviewTab', () => {
  let mutate: ReturnType<typeof vi.fn>;
  let capturedOnSuccess: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    capturedOnSuccess = undefined;
    (useUpdateOrganizationMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate, isPending: false };
    });
  });

  it('renders read-only organisation details by default', () => {
    render(<OverviewTab org={baseOrg} />);
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('org-1')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Creada')).toBeInTheDocument();
    expect(screen.getByText('Actualizada')).toBeInTheDocument();
  });

  it('switches to edit mode when the pencil button is clicked', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    expect(screen.getByDisplayValue('Acme Inc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/ })).toBeInTheDocument();
  });

  it('disables the Save button when name is too short', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    fireEvent.change(screen.getByDisplayValue('Acme Inc'), { target: { value: 'A' } });
    const saveBtn = screen.getByRole('button', { name: /Guardar/ }) as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('cancels edit mode and restores the original name', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    fireEvent.change(screen.getByDisplayValue('Acme Inc'), { target: { value: 'Foo' } });
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/ }));
    expect(screen.queryByRole('button', { name: /Guardar/ })).not.toBeInTheDocument();
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
  });

  it('fires the update mutation when submitting a valid name', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    fireEvent.change(screen.getByDisplayValue('Acme Inc'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(mutate).toHaveBeenCalledWith({ id: 'org-1', data: { name: 'New Name' } });
  });

  it('does not fire the mutation when name is too short on submit', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    const input = screen.getByDisplayValue('Acme Inc') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'X' } });
    // Submit form via Enter key
    fireEvent.submit(input.closest('form')!);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('exits edit mode on mutation success', () => {
    render(<OverviewTab org={baseOrg} />);
    fireEvent.click(screen.getByTitle('Editar nombre'));
    expect(screen.getByDisplayValue('Acme Inc')).toBeInTheDocument();
    act(() => { capturedOnSuccess?.(); });
    expect(screen.queryByRole('button', { name: /Guardar/ })).not.toBeInTheDocument();
  });
});
