import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders the input with the given value and placeholder', () => {
    render(<SearchInput value="hi" onChange={vi.fn()} placeholder="Search…" />);
    const input = screen.getByPlaceholderText('Search…') as HTMLInputElement;
    expect(input.value).toBe('hi');
  });

  it('falls back to placeholder for the aria-label when none is provided', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Find" />);
    expect(screen.getByLabelText('Find')).toBeInTheDocument();
  });

  it('uses the explicit aria-label when provided', () => {
    render(
      <SearchInput value="" onChange={vi.fn()} placeholder="Find" aria-label="Search items" />,
    );
    expect(screen.getByLabelText('Search items')).toBeInTheDocument();
  });

  it('fires onChange when the user types', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Search" />);
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('does not render the clear button when value is empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search" />);
    expect(screen.queryByLabelText('clear search')).not.toBeInTheDocument();
  });

  it('renders the clear button when value is non-empty', () => {
    render(<SearchInput value="hello" onChange={vi.fn()} placeholder="Search" />);
    expect(screen.getByLabelText('clear search')).toBeInTheDocument();
  });

  it('clears the value when the clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchInput value="hello" onChange={onChange} placeholder="Search" />);
    fireEvent.click(screen.getByLabelText('clear search'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('appends the className to the wrapper', () => {
    const { container } = render(
      <SearchInput value="" onChange={vi.fn()} placeholder="x" className="my-extra" />,
    );
    expect(container.firstChild).toHaveClass('my-extra');
  });
});
