/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from './MultiSelect';

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-down" />,
  Loader2: () => <span data-testid="loader" />,
  CheckSquare: () => <span data-testid="check-square" />,
  Square: () => <span data-testid="square" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (key === 'ui.selected') return `${opts?.count ?? 0} seleccionados`;
      if (key === 'ui.loading') return 'Cargando...';
      if (key === 'ui.noOptions') return 'Sin opciones disponibles';
      if (key === 'ui.selectAll') return 'Seleccionar todo';
      if (key === 'ui.clear') return 'Limpiar';
      return key;
    },
    i18n: { language: 'es' },
  }),
}));

const OPTIONS = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
  { value: 'opt4', label: 'Option 4' },
];

const renderMultiSelect = (props = {}) =>
  render(
    <MultiSelect
      label="Test label"
      options={OPTIONS}
      placeholder="Select options"
      {...props}
    />
  );

describe('MultiSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and placeholder', () => {
    renderMultiSelect({ value: [] });
    expect(screen.getByText('Test label')).toBeInTheDocument();
    // Trigger shows placeholder when nothing selected
    expect(screen.getByTestId('multiselect-trigger')).toHaveTextContent('Select options');
  });

  it('shows selected labels when 1-2 items selected', () => {
    renderMultiSelect({ value: ['opt1', 'opt2'] });
    expect(screen.getByTestId('multiselect-trigger')).toHaveTextContent('Option 1, Option 2');
  });

  it('shows "N seleccionados" when 3+ items selected', () => {
    renderMultiSelect({ value: ['opt1', 'opt2', 'opt3'] });
    expect(screen.getByTestId('multiselect-trigger')).toHaveTextContent('3 seleccionados');
  });

  it('onChange called when option clicked', () => {
    const onChange = vi.fn();
    renderMultiSelect({ value: [], onChange });
    // Open dropdown
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    // Click option
    fireEvent.click(screen.getByTestId('multiselect-option-opt1'));
    expect(onChange).toHaveBeenCalledWith(['opt1']);
  });

  it('"Limpiar" clears all selections', () => {
    const onChange = vi.fn();
    renderMultiSelect({ value: ['opt1', 'opt2'], onChange });
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    fireEvent.click(screen.getByTestId('multiselect-clear'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('"Seleccionar todo" selects all options', () => {
    const onChange = vi.fn();
    renderMultiSelect({ value: [], onChange });
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    fireEvent.click(screen.getByTestId('multiselect-select-all'));
    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2', 'opt3', 'opt4']);
  });

  it('shows loading state', () => {
    renderMultiSelect({ value: [], isLoading: true });
    expect(screen.getByTestId('multiselect-trigger')).toHaveTextContent('Cargando...');
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    renderMultiSelect({ value: [], disabled: true });
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    expect(screen.queryByTestId('multiselect-dropdown')).not.toBeInTheDocument();
  });

  it('toggles item out of selection when already selected', () => {
    const onChange = vi.fn();
    renderMultiSelect({ value: ['opt1'], onChange });
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    fireEvent.click(screen.getByTestId('multiselect-option-opt1'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows error message when error prop is provided', () => {
    renderMultiSelect({ value: [], error: 'Campo requerido' });
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('shows "Sin opciones disponibles" when options is empty', () => {
    renderMultiSelect({ value: [], options: [] });
    fireEvent.click(screen.getByTestId('multiselect-trigger'));
    expect(screen.getByText('Sin opciones disponibles')).toBeInTheDocument();
  });
});
