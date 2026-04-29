import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('./Calendar', () => ({
  Calendar: ({ onChange, mode }: any) => (
    <div data-testid="calendar">
      <button
        onClick={() =>
          mode === 'single'
            ? onChange(new Date('2024-05-15'))
            : onChange({ start: new Date('2024-05-01'), end: new Date('2024-05-31') })
        }
      >
        pick
      </button>
    </div>
  ),
}));

import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders the placeholder when no value is set (single mode)', () => {
    render(<DatePicker mode="single" placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('falls back to ui.selectDate when no placeholder in single mode', () => {
    render(<DatePicker mode="single" />);
    expect(screen.getByText('ui.selectDate')).toBeInTheDocument();
  });

  it('falls back to ui.selectDateRange when no placeholder in range mode', () => {
    render(<DatePicker mode="range" />);
    expect(screen.getByText('ui.selectDateRange')).toBeInTheDocument();
  });

  it('formats a single Date value', () => {
    render(<DatePicker mode="single" value={new Date('2024-05-15T12:00:00')} />);
    expect(screen.getByText(/15.*mayo|de mayo/i)).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<DatePicker mode="single" label="When" />);
    expect(screen.getByText('When')).toBeInTheDocument();
  });

  it('opens the calendar dropdown when the trigger is clicked', () => {
    render(<DatePicker mode="single" placeholder="x" />);
    fireEvent.click(screen.getByText('x'));
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('fires onChange with the selected single date and closes dropdown', () => {
    const onChange = vi.fn();
    render(<DatePicker mode="single" placeholder="x" onChange={onChange} />);
    fireEvent.click(screen.getByText('x'));
    fireEvent.click(screen.getByText('pick'));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByTestId('calendar')).not.toBeInTheDocument();
  });

  it('fires onChange with a complete range and closes dropdown', () => {
    const onChange = vi.fn();
    render(<DatePicker mode="range" placeholder="x" onChange={onChange} />);
    fireEvent.click(screen.getByText('x'));
    fireEvent.click(screen.getByText('pick'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: expect.any(Date), end: expect.any(Date) }),
    );
    expect(screen.queryByTestId('calendar')).not.toBeInTheDocument();
  });

  it('clears the value when the X button is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker mode="single" value={new Date('2024-05-15T12:00:00')} onChange={onChange} />,
    );
    // Inner X button has class p-1; the outer trigger does not.
    const clearBtn = container.querySelector('button.p-1') as HTMLButtonElement;
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('disables the trigger when disabled', () => {
    render(<DatePicker mode="single" disabled placeholder="x" />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders the error message', () => {
    render(<DatePicker mode="single" error="Invalid date" placeholder="x" />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('formats a range with both start and end', () => {
    render(
      <DatePicker
        mode="range"
        value={{ start: new Date('2024-05-01'), end: new Date('2024-05-31') }}
      />,
    );
    expect(screen.getByText(/May.*1|1 May/i)).toBeInTheDocument();
  });
});
