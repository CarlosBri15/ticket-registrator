import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { es } from 'date-fns/locale';
import { DateGroupHeader } from './DateGroupHeader';

describe('DateGroupHeader', () => {
  const baseProps = {
    today: 'Hoy',
    yesterday: 'Ayer',
    dateLocale: es,
  };

  it('renders "today" label when the date is today', () => {
    render(<DateGroupHeader {...baseProps} count={3} date={new Date()} />);
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('renders "yesterday" label when the date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateGroupHeader {...baseProps} count={1} date={yesterday} />);
    expect(screen.getByText('Ayer')).toBeInTheDocument();
  });

  it('renders a localised, capitalised date for older dates', () => {
    const old = new Date('2024-01-15T12:00:00');
    render(<DateGroupHeader {...baseProps} count={5} date={old} />);
    const text = screen.getByText(/lunes|January|enero/i);
    expect(text.textContent![0]).toBe(text.textContent![0].toUpperCase());
  });

  it('renders the count', () => {
    render(<DateGroupHeader {...baseProps} count={42} date={new Date()} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
