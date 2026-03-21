import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../Select', () => ({
  Select: ({ label, options, onChange, value, placeholder, error }: any) => (
    <div data-testid="select">
      <span data-testid="select-label">{label}</span>
      {placeholder && <span data-testid="select-placeholder">{placeholder}</span>}
      {error && <span data-testid="select-error">{error}</span>}
      {options?.map((o: any) => (
        <button
          key={o.value}
          data-testid={`select-option-${o.value}`}
          onClick={() => onChange?.(o.value)}
          aria-selected={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { ReportTypeSelect } from './ReportTypeSelect';

// ─── Tests ────────────────────────────────────────────────────────────────────

const EXPECTED_KEYS = [
  'trips.typeBusinessTrip',
  'trips.typeTraining',
  'trips.typeConference',
  'trips.typeClient',
  'trips.typeProject',
  'trips.typeOther',
];

describe('ReportTypeSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default label "Categoría"', () => {
    render(<ReportTypeSelect />);
    expect(screen.getByTestId('select-label')).toHaveTextContent('Categoría');
  });

  it('renders with custom label', () => {
    render(<ReportTypeSelect label="Tipo de reporte" />);
    expect(screen.getByTestId('select-label')).toHaveTextContent('Tipo de reporte');
  });

  it('renders all report type options via translation keys', () => {
    render(<ReportTypeSelect />);
    for (const key of EXPECTED_KEYS) {
      expect(screen.getByTestId(`select-option-${key}`)).toBeInTheDocument();
    }
  });

  it('renders exactly 6 options', () => {
    render(<ReportTypeSelect />);
    expect(screen.getAllByRole('button')).toHaveLength(EXPECTED_KEYS.length);
  });

  it('renders default placeholder', () => {
    render(<ReportTypeSelect />);
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Selecciona una categoría');
  });

  it('calls onChange with the selected type value', () => {
    const onChange = vi.fn();
    render(<ReportTypeSelect onChange={onChange} />);
    fireEvent.click(screen.getByTestId(`select-option-${EXPECTED_KEYS[0]}`));
    expect(onChange).toHaveBeenCalledWith(EXPECTED_KEYS[0]);
  });

  it('reflects the current value via aria-selected', () => {
    const selectedKey = EXPECTED_KEYS[2];
    render(<ReportTypeSelect value={selectedKey} />);
    expect(screen.getByTestId(`select-option-${selectedKey}`)).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId(`select-option-${EXPECTED_KEYS[0]}`)).toHaveAttribute('aria-selected', 'false');
  });

  it('passes error prop to Select', () => {
    render(<ReportTypeSelect error="Campo requerido" />);
    expect(screen.getByTestId('select-error')).toHaveTextContent('Campo requerido');
  });

  it('passes custom placeholder to Select', () => {
    render(<ReportTypeSelect placeholder="Elige categoría" />);
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Elige categoría');
  });
});
