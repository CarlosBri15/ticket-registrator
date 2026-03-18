import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <svg data-testid="chevron-icon" className={className} />,
  Check: () => <svg data-testid="check-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

const defaultOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];

describe('Select', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the label', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByText('Rol')).toBeInTheDocument();
  });

  it('renders the trigger button with combobox role', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows placeholder text when no value is selected', () => {
    render(<Select label="Rol" options={defaultOptions} placeholder="Elige un rol" value="" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Elige un rol');
  });

  it('shows selected option label when value is set', () => {
    render(<Select label="Rol" options={defaultOptions} value="admin" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Admin');
  });

  it('renders chevron icon', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('does not render the listbox initially (closed)', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // ── Open / close ───────────────────────────────────────────────────────────

  it('opens the dropdown when the trigger is clicked', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all options when open', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Employee' })).toBeInTheDocument();
  });

  it('closes the dropdown when the trigger is clicked again', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes when Escape key is pressed', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('toggles open when Enter key is pressed', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('toggles open when Space key is pressed', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  // ── Selection ──────────────────────────────────────────────────────────────

  it('calls onChange with the option value when an option is clicked', () => {
    const handleChange = vi.fn();
    render(<Select label="Rol" options={defaultOptions} value="" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Admin' }));
    expect(handleChange).toHaveBeenCalledWith('admin');
  });

  it('closes the dropdown after selecting an option', () => {
    render(<Select label="Rol" options={defaultOptions} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Admin' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the currently selected option with aria-selected="true"', () => {
    render(<Select label="Rol" options={defaultOptions} value="admin" />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Admin' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Employee' })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders check icon next to the selected option', () => {
    render(<Select label="Rol" options={defaultOptions} value="employee" />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows "Sin opciones disponibles" when options array is empty', () => {
    render(<Select label="Rol" options={[]} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText(/sin opciones disponibles/i)).toBeInTheDocument();
  });

  // ── ARIA ───────────────────────────────────────────────────────────────────

  it('sets aria-expanded to false when closed', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true when open', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses provided id on the trigger', () => {
    render(<Select label="Rol" id="my-select" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-select');
  });

  it('generates id from label when id is not provided', () => {
    render(<Select label="My Role" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'select-my-role');
  });

  // ── Disabled ───────────────────────────────────────────────────────────────

  it('disables the trigger button when disabled prop is true', () => {
    render(<Select label="Rol" options={defaultOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not open the dropdown when disabled', () => {
    render(<Select label="Rol" options={defaultOptions} disabled />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it('disables trigger and shows "Cargando..." when isLoading is true', () => {
    render(<Select label="Rol" options={[]} isLoading />);
    const btn = screen.getByRole('combobox');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Cargando...');
  });

  it('renders loader icon when isLoading is true', () => {
    render(<Select label="Rol" options={[]} isLoading />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it('renders error message when error prop is provided', () => {
    render(<Select label="Rol" options={defaultOptions} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('does not render error when error prop is absent', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.queryByText('Campo requerido')).not.toBeInTheDocument();
  });

  it('applies error border class when error is provided', () => {
    render(<Select label="Rol" options={defaultOptions} error="Error" />);
    expect(screen.getByRole('combobox').className).toContain('border-accent');
  });

  it('applies normal border class when no error', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByRole('combobox').className).toContain('border-gray-200');
  });

  // ── Required ───────────────────────────────────────────────────────────────

  it('marks trigger as required when required prop is passed', () => {
    render(<Select label="Rol" options={defaultOptions} required />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  it('renders required asterisk next to label', () => {
    render(<Select label="Rol" options={defaultOptions} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
