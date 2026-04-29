import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders the label', () => {
    render(<TextArea label="Notes" />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders the textarea with the given value', () => {
    render(<TextArea label="Notes" value="hello" onChange={() => {}} />);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('hello');
  });

  it('does not show error message when no error is provided', () => {
    const { container } = render(<TextArea label="Notes" />);
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('shows error message when error is provided', () => {
    render(<TextArea label="Notes" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('forwards onChange', () => {
    const onChange = vi.fn();
    render(<TextArea label="Notes" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('appends extra className to the textarea', () => {
    render(<TextArea label="Notes" className="extra" />);
    expect(screen.getByRole('textbox').className).toMatch(/extra/);
  });

  it('forwards arbitrary textarea props (placeholder, rows, disabled)', () => {
    render(<TextArea label="Notes" placeholder="ph" rows={5} disabled />);
    const ta = screen.getByPlaceholderText('ph') as HTMLTextAreaElement;
    expect(ta.rows).toBe(5);
    expect(ta.disabled).toBe(true);
  });
});
