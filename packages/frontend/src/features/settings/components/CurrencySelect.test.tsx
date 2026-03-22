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

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { CurrencySelect } from './CurrencySelect';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CurrencySelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default label "Moneda"', () => {
    render(<CurrencySelect />);
    expect(screen.getByTestId('select-label')).toHaveTextContent('Moneda');
  });

  it('renders with custom label', () => {
    render(<CurrencySelect label="Divisa" />);
    expect(screen.getByTestId('select-label')).toHaveTextContent('Divisa');
  });

  it('renders all supported currencies as options', () => {
    render(<CurrencySelect />);
    for (const currency of ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'MXN', 'COP', 'ARS', 'BRL']) {
      expect(screen.getByTestId(`select-option-${currency}`)).toBeInTheDocument();
    }
  });

  it('renders default placeholder', () => {
    render(<CurrencySelect />);
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Selecciona una moneda');
  });

  it('calls onChange with the selected currency value', () => {
    const onChange = vi.fn();
    render(<CurrencySelect onChange={onChange} />);
    fireEvent.click(screen.getByTestId('select-option-USD'));
    expect(onChange).toHaveBeenCalledWith('USD');
  });

  it('reflects the current value via aria-selected', () => {
    render(<CurrencySelect value="EUR" />);
    expect(screen.getByTestId('select-option-EUR')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('select-option-USD')).toHaveAttribute('aria-selected', 'false');
  });

  it('passes error prop to Select', () => {
    render(<CurrencySelect error="Campo requerido" />);
    expect(screen.getByTestId('select-error')).toHaveTextContent('Campo requerido');
  });

  it('passes custom placeholder to Select', () => {
    render(<CurrencySelect placeholder="Elige moneda" />);
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Elige moneda');
  });
});
