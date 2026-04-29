import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar, type DateRange } from './Calendar';

describe('Calendar', () => {
  it('renders month header and weekday labels', () => {
    render(<Calendar value={new Date('2024-05-15')} />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('renders all visible days for the current month', () => {
    render(<Calendar value={new Date('2024-05-15')} />);
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });

  it('navigates to the next month when chevron-right is clicked', () => {
    const { container } = render(<Calendar value={new Date('2024-05-15')} />);
    const buttons = container.querySelectorAll('button');
    // First button is prev, second is next based on header layout
    const next = buttons[1] as HTMLButtonElement;
    fireEvent.click(next);
    expect(screen.getByText(/junio|2024/i)).toBeInTheDocument();
  });

  it('navigates to the previous month when chevron-left is clicked', () => {
    const { container } = render(<Calendar value={new Date('2024-05-15')} />);
    const prev = container.querySelector('button') as HTMLButtonElement;
    fireEvent.click(prev);
    expect(screen.getByText(/abril/i)).toBeInTheDocument();
  });

  it('fires onChange with the selected date in single mode', () => {
    const onChange = vi.fn();
    render(<Calendar mode="single" value={new Date('2024-05-15')} onChange={onChange} />);
    const day20 = screen.getAllByText('20')[0].closest('button')!;
    fireEvent.click(day20);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('starts a new range when start is empty', () => {
    const onChange = vi.fn();
    render(<Calendar mode="range" value={null} onChange={onChange} />);
    const day10 = screen.getAllByText('10')[0].closest('button')!;
    fireEvent.click(day10);
    expect(onChange).toHaveBeenCalledWith({ start: expect.any(Date), end: null });
  });

  it('completes a range when start is set and clicked day is after start', () => {
    const onChange = vi.fn();
    const value: DateRange = { start: new Date('2024-05-10'), end: null };
    render(<Calendar mode="range" value={value} onChange={onChange} />);
    const day20 = screen.getAllByText('20')[0].closest('button')!;
    fireEvent.click(day20);
    expect(onChange).toHaveBeenCalledWith({
      start: expect.any(Date),
      end: expect.any(Date),
    });
    const arg = onChange.mock.calls[0][0] as DateRange;
    expect((arg.end as Date).getDate()).toBe(20);
  });

  it('swaps start and end when clicked day is before current start', () => {
    const onChange = vi.fn();
    const value: DateRange = { start: new Date('2024-05-20'), end: null };
    render(<Calendar mode="range" value={value} onChange={onChange} />);
    const day5 = screen.getAllByText('5')[0].closest('button')!;
    fireEvent.click(day5);
    const arg = onChange.mock.calls[0][0] as DateRange;
    expect((arg.start as Date).getDate()).toBe(5);
    expect((arg.end as Date).getDate()).toBe(20);
  });

  it('starts a new range when both start and end are already set', () => {
    const onChange = vi.fn();
    const value: DateRange = { start: new Date('2024-05-10'), end: new Date('2024-05-20') };
    render(<Calendar mode="range" value={value} onChange={onChange} />);
    const day25 = screen.getAllByText('25')[0].closest('button')!;
    fireEvent.click(day25);
    expect(onChange).toHaveBeenCalledWith({ start: expect.any(Date), end: null });
  });

  it('handles invalid initial Date gracefully', () => {
    const { container } = render(<Calendar value={new Date('invalid')} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('appends extra className', () => {
    const { container } = render(<Calendar className="my-cls" />);
    expect(container.firstChild).toHaveClass('my-cls');
  });
});
