import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrgSelect } from './OrgSelect';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useOrganizationsQuery: vi.fn(),
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

import { useOrganizationsQuery } from '@ticket-registrator/shared';

const mockOrgs = [
  { id: 'o1', name: 'Acme Corp', createdAt: '', updatedAt: '' },
  { id: 'o2', name: 'Globex', createdAt: '', updatedAt: '' },
];

const setupMocks = () => {
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: mockOrgs,
    isLoading: false,
  });
};

describe('OrgSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Options rendering ────────────────────────────────────────────────────────

  it('renders org options from the query', () => {
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Globex' })).toBeInTheDocument();
  });

  it('renders an empty options list when orgs is undefined', () => {
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false });
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.queryByRole('option', { name: 'Acme Corp' })).not.toBeInTheDocument();
  });

  it('renders empty list gracefully when orgs array is empty', () => {
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(<OrgSelect value="" onChange={() => {}} />);
    // only the placeholder option
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it('disables the select while orgs are loading', () => {
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('enables the select once orgs have loaded', () => {
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  // ── Default props ────────────────────────────────────────────────────────────

  it('uses "Organización" as the default label', () => {
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Organización' })).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    render(<OrgSelect label="Empresa" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Empresa' })).toBeInTheDocument();
  });

  it('uses default placeholder', () => {
    render(<OrgSelect value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Selecciona una organización' })).toBeInTheDocument();
  });

  it('accepts a custom placeholder', () => {
    render(<OrgSelect placeholder="Elige una empresa" value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Elige una empresa' })).toBeInTheDocument();
  });

  // ── Prop forwarding ─────────────────────────────────────────────────────────

  it('forwards the id prop', () => {
    render(<OrgSelect id="my-org-select" value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-org-select');
  });

  it('forwards required prop', () => {
    render(<OrgSelect required value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('forwards error prop', () => {
    render(<OrgSelect error="Organización requerida" value="" onChange={() => {}} />);
    expect(screen.getByText('Organización requerida')).toBeInTheDocument();
  });

  it('forwards the current value', () => {
    render(<OrgSelect value="o1" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('o1');
  });

  // ── onChange ────────────────────────────────────────────────────────────────

  it('calls onChange with the selected value', () => {
    const handleChange = vi.fn();
    render(<OrgSelect value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'o2' } });
    expect(handleChange).toHaveBeenCalledWith('o2');
  });
});
