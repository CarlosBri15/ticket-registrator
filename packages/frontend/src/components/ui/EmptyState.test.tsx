import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders icon, title and description', () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">i</span>}
        title="Nothing here"
        description="Try adding something"
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Try adding something')).toBeInTheDocument();
  });

  it('does not render an action wrapper when no action is provided', () => {
    const { container } = render(
      <EmptyState icon={<span />} title="t" description="d" />,
    );
    expect(container.querySelector('.mt-2')).not.toBeInTheDocument();
  });

  it('renders the action when provided', () => {
    render(
      <EmptyState
        icon={<span />}
        title="t"
        description="d"
        action={<button>Add</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('appends extra className', () => {
    const { container } = render(
      <EmptyState icon={<span />} title="t" description="d" className="extra-cls" />,
    );
    expect(container.firstChild).toHaveClass('extra-cls');
  });
});
