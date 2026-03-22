import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSelect } from './RoleSelect';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useRolesQuery: vi.fn(),
    useSystemRolesQuery: vi.fn(),
  };
});

vi.mock('../Select', () => ({
  Select: ({ label, options, value, onChange, placeholder, isLoading, required, error, id }: any) => (
    <div>
      <select
        aria-label={label}
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={isLoading}
        data-loading={String(isLoading)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

import { useRolesQuery, useSystemRolesQuery } from '@ticket-registrator/shared';

const companyRoles = [
  { id: 'r1', name: 'Admin' },
  { id: 'r2', name: 'Manager' },
];
const systemRoles = [
  { id: 's1', name: 'SuperAdmin' },
  { id: 's2', name: 'Employee' },
];

const setupMocks = () => {
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: companyRoles, isLoading: false });
  (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: systemRoles, isLoading: false });
};

describe('RoleSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Hook selection ──────────────────────────────────────────────────────────

  it('calls useRolesQuery with the provided companyId', () => {
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(useRolesQuery).toHaveBeenCalledWith('company-1');
  });

  it('shows company roles when companyId is provided', () => {
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Manager' })).toBeInTheDocument();
  });

  it('does NOT show system roles when companyId is provided', () => {
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(screen.queryByRole('option', { name: 'SuperAdmin' })).not.toBeInTheDocument();
  });

  it('falls back to useSystemRolesQuery when companyId is null', () => {
    render(<RoleSelect companyId={null} value="" onChange={() => {}} />);
    expect(useSystemRolesQuery).toHaveBeenCalled();
  });

  it('shows system roles when companyId is null', () => {
    render(<RoleSelect companyId={null} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'SuperAdmin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Employee' })).toBeInTheDocument();
  });

  it('falls back to useSystemRolesQuery when companyId is undefined', () => {
    render(<RoleSelect value="" onChange={() => {}} />);
    expect(useSystemRolesQuery).toHaveBeenCalled();
  });

  it('shows system roles when companyId is undefined', () => {
    render(<RoleSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'SuperAdmin' })).toBeInTheDocument();
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  it('disables the select while company roles are loading', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('disables the select while system roles are loading', () => {
    (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(<RoleSelect companyId={null} value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('enables the select once company roles have loaded', () => {
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  // ── Options rendering ────────────────────────────────────────────────────────

  it('renders an empty options list when roles is undefined', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false });
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    expect(screen.queryByRole('option', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('renders an empty options list gracefully when roles array is empty', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(<RoleSelect companyId="company-1" value="" onChange={() => {}} />);
    // Only the placeholder option should be present
    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(1); // placeholder only
  });

  // ── Prop forwarding ─────────────────────────────────────────────────────────

  it('uses "Rol" as the default label', () => {
    render(<RoleSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Rol' })).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(<RoleSelect label="Asignar Rol" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Asignar Rol' })).toBeInTheDocument();
  });

  it('renders the placeholder option', () => {
    render(<RoleSelect placeholder="Elige un rol" value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Elige un rol' })).toBeInTheDocument();
  });

  it('uses "Selecciona un rol" as the default placeholder', () => {
    render(<RoleSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Selecciona un rol' })).toBeInTheDocument();
  });

  it('forwards the id to the underlying Select', () => {
    render(<RoleSelect id="my-role-select" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-role-select');
  });

  it('forwards required to the underlying Select', () => {
    render(<RoleSelect required value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('forwards error to the underlying Select', () => {
    render(<RoleSelect error="Rol requerido" value="" onChange={() => {}} />);
    expect(screen.getByText('Rol requerido')).toBeInTheDocument();
  });

  it('forwards the current value to the underlying Select', () => {
    render(<RoleSelect companyId="company-1" value="r1" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('r1');
  });

  // ── onChange ────────────────────────────────────────────────────────────────

  it('calls onChange with the selected value and the full role object', () => {
    const handleChange = vi.fn();
    render(<RoleSelect companyId="company-1" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'r2' } });
    expect(handleChange).toHaveBeenCalledWith('r2', { id: 'r2', name: 'Manager' });
  });

  it('calls onChange with system role when companyId is null', () => {
    const handleChange = vi.fn();
    render(<RoleSelect companyId={null} value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 's1' } });
    expect(handleChange).toHaveBeenCalledWith('s1', { id: 's1', name: 'SuperAdmin' });
  });
});
