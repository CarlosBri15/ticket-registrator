import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Dashboard" subtitle="Overview of activity" />);
    expect(screen.getByText('Overview of activity')).toBeInTheDocument();
  });

  it('does not render subtitle element when absent', () => {
    render(<PageHeader title="Dashboard" />);
    // No <p> for subtitle should exist
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.nextSibling).toBeNull();
  });

  it('renders icon container when icon is provided', () => {
    render(<PageHeader title="Dashboard" icon={<span data-testid="header-icon">🏠</span>} />);
    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
  });

  it('does not render icon container when icon is absent', () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    // No w-9 h-9 icon wrapper
    expect(container.querySelector('.w-9.h-9')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<PageHeader title="Dashboard" actions={<button>New</button>} />);
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('does not render actions wrapper when absent', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders all optional props together', () => {
    render(
      <PageHeader
        title="Reports"
        subtitle="All trips"
        icon={<span data-testid="icon">📊</span>}
        actions={<button>Export</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reports');
    expect(screen.getByText('All trips')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
