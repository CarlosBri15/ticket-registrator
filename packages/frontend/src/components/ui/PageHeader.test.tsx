import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as h1', () => {
    render(<PageHeader title="Reports" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reports');
  });

  it('renders back button when back is provided and triggers onClick', async () => {
    const onClick = vi.fn();
    render(<PageHeader title="Detail" back={{ label: 'Back to list', onClick }} />);

    const backBtn = screen.getByRole('button', { name: /back to list/i });
    await userEvent.click(backBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when absent', () => {
    render(<PageHeader title="Detail" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders inline stats when provided', () => {
    render(
      <PageHeader
        title="Reports"
        stats={[
          { label: 'Total', value: 12 },
          { label: 'Active', value: 3 },
        ]}
      />,
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the optional stat icon when provided', () => {
    render(
      <PageHeader
        title="Reports"
        stats={[{ label: 'Tickets', value: 4, icon: <span data-testid="stat-icon" /> }]}
      />,
    );
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders a divider between consecutive stats', () => {
    const { container } = render(
      <PageHeader
        title="Reports"
        stats={[
          { label: 'A', value: 1 },
          { label: 'B', value: 2 },
          { label: 'C', value: 3 },
        ]}
      />,
    );
    // Two dividers for three items (rendered as hairline span).
    expect(container.querySelectorAll('span[aria-hidden="true"].w-px').length).toBe(2);
  });

  it('renders actions when provided', () => {
    render(<PageHeader title="Reports" actions={<button>New</button>} />);
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('does not render actions wrapper when absent', () => {
    render(<PageHeader title="Reports" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders title, back, stats and actions together', async () => {
    const onClick = vi.fn();
    render(
      <PageHeader
        title="Trip 42"
        back={{ label: 'Back', onClick }}
        stats={[{ label: 'Tickets', value: 8 }]}
        actions={<button>Submit</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trip 42');
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
