import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders input element', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render error when error prop is absent', () => {
    render(<Input label="Name" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error styling when error is provided', () => {
    const { container } = render(<Input label="Email" error="Required" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-danger');
  });

  it('applies normal border when no error', () => {
    const { container } = render(<Input label="Email" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-[var(--color-border-main)]');
    expect(input?.className).not.toContain('border-danger');
  });

  it('passes extra props to input', () => {
    render(<Input label="Email" type="email" placeholder="you@email.com" />);
    const input = screen.getByPlaceholderText('you@email.com');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders as disabled when disabled prop is passed', () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
