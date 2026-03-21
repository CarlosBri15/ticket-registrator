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

  it('renders the trigger button with combobox role (native select)', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('shows placeholder text when no value is selected', () => {
    render(<Select label="Rol" options={defaultOptions} placeholder="Elige un rol" value="" />);
    expect(screen.getByTestId('select-trigger')).toHaveTextContent('Elige un rol');
  });

  it('shows selected option label when value is set', () => {
    render(<Select label="Rol" options={defaultOptions} value="admin" />);
    expect(screen.getByTestId('select-trigger')).toHaveTextContent('Admin');
  });

  it('renders chevron icon', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('does not render the custom dropdown initially (closed)', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  // ── Open / close ───────────────────────────────────────────────────────────

  it('opens the dropdown when the trigger is clicked', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();
  });

  it('shows all options in custom dropdown when open', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.getByTestId('select-option-admin')).toBeInTheDocument();
    expect(screen.getByTestId('select-option-employee')).toBeInTheDocument();
    // Use getAllByText because labels exist in both native select and custom portal
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Employee').length).toBeGreaterThanOrEqual(1);
  });

  it('closes the dropdown when the trigger is clicked again', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  it('closes when Escape key is pressed on trigger', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    fireEvent.keyDown(screen.getByTestId('select-trigger'), { key: 'Escape' });
    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  it('toggles open when Enter key is pressed on trigger', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.keyDown(screen.getByTestId('select-trigger'), { key: 'Enter' });
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();
  });

  it('toggles open when Space key is pressed on trigger', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    fireEvent.keyDown(screen.getByTestId('select-trigger'), { key: ' ' });
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();
  });

  // ── Selection ──────────────────────────────────────────────────────────────

  it('calls onChange with the option value when an option is clicked', () => {
    const handleChange = vi.fn();
    render(<Select label="Rol" options={defaultOptions} value="" onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    fireEvent.click(screen.getByTestId('select-option-admin'));
    expect(handleChange).toHaveBeenCalledWith('admin');
  });

  it('closes the dropdown after selecting an option', () => {
    render(<Select label="Rol" options={defaultOptions} value="" onChange={() => {}} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    fireEvent.click(screen.getByTestId('select-option-admin'));
    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  it('marks the currently selected option with custom selected state in dropdown', () => {
    render(<Select label="Rol" options={defaultOptions} value="admin" />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    // We check the custom background class instead of aria-selected for the portal
    expect(screen.getByTestId('select-option-admin').className).toContain('bg-brand/10');
    expect(screen.getByTestId('select-option-employee').className).not.toContain('bg-brand/10');
    // Also verify the native select value
    expect(screen.getByRole('combobox')).toHaveValue('admin');
  });

  it('renders check icon next to the selected option in dropdown', () => {
    render(<Select label="Rol" options={defaultOptions} value="employee" />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows "Sin opciones disponibles" when options array is empty', () => {
    render(<Select label="Rol" options={[]} />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.getByText(/sin opciones disponibles/i)).toBeInTheDocument();
  });

  // ── ARIA ───────────────────────────────────────────────────────────────────

  // Note: aria-expanded is no longer on the custom button as it's aria-hidden
  // and native selects don't use aria-expanded. If we wanted to keep testing this
  // we would need to maintain the role on the button, which SonarLint forbids.

  it('uses provided id on the native select', () => {
    render(<Select label="Rol" id="my-select" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-select');
  });

  it('generates id from label when id is not provided', () => {
    render(<Select label="My Role" options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'select-my-role');
  });

  // ── Disabled ───────────────────────────────────────────────────────────────

  it('disables the native select and visual trigger when disabled prop is true', () => {
    render(<Select label="Rol" options={defaultOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByTestId('select-trigger')).toBeDisabled();
  });

  it('does not open the dropdown when disabled', () => {
    render(<Select label="Rol" options={defaultOptions} disabled />);
    fireEvent.click(screen.getByTestId('select-trigger'));
    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it('disables trigger and shows "Cargando..." when isLoading is true', () => {
    render(<Select label="Rol" options={[]} isLoading />);
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent('Cargando...');
  });

  it('renders loader icon when isLoading is true', () => {
    render(<Select label="Rol" options={[]} isLoading />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it('renders error message and applies style to trigger', () => {
    render(<Select label="Rol" options={defaultOptions} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
    // The visual trigger should show the error state class
    expect(screen.getByTestId('select-trigger').className).toContain('border-danger');
  });

  it('does not render error when error prop is absent', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.queryByText('Campo requerido')).not.toBeInTheDocument();
  });

  it('applies normal border class when no error', () => {
    render(<Select label="Rol" options={defaultOptions} />);
    expect(screen.getByTestId('select-trigger').className).toContain('border-slate-200');
  });

  // ── Required ───────────────────────────────────────────────────────────────

  it('marks native select as required when required prop is passed', () => {
    render(<Select label="Rol" options={defaultOptions} required />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('renders required asterisk next to label', () => {
    render(<Select label="Rol" options={defaultOptions} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
