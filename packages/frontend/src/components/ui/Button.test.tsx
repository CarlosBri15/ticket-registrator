import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when isLoading', () => {
    const { container } = render(<Button isLoading>Load</Button>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not show spinner when not loading', () => {
    const { container } = render(<Button>Load</Button>);
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-brand');
  });

  it('renders with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-white');
  });

  it('renders with outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.querySelector('button')?.className).toContain('border-brand');
  });

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-transparent');
  });

  it('renders with accent variant', () => {
    const { container } = render(<Button variant="accent">Accent</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-accent');
  });

  it('renders with fintech variant', () => {
    const { container } = render(<Button variant="fintech">Fintech</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-gradient-to-r');
  });

  it('renders with white variant', () => {
    const { container } = render(<Button variant="white">White</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-white');
  });

  it('renders with ghost-white variant', () => {
    const { container } = render(<Button variant="ghost-white">Ghost White</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-white/10');
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    expect(container.querySelector('button')?.className).toContain('custom-class');
  });

  it('passes extra props to button element', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
