import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as h1', () => {
    render(<PageHeader title="Reports" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reports');
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Reports" subtitle="All trips" />);
    expect(screen.getByText('All trips')).toBeInTheDocument();
  });

  it('does not render subtitle element when absent', () => {
    render(<PageHeader title="Reports" />);
    expect(screen.queryByText(/all trips/i)).not.toBeInTheDocument();
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

  it('renders actions when provided', () => {
    render(<PageHeader title="Reports" actions={<button>New</button>} />);
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('does not render actions wrapper when absent', () => {
    render(<PageHeader title="Reports" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders title, subtitle, back, stats and actions together', async () => {
    const onClick = vi.fn();
    render(
      <PageHeader
        title="Trip 42"
        subtitle="Madrid → Lisbon"
        back={{ label: 'Back', onClick }}
        stats={[{ label: 'Tickets', value: 8 }]}
        actions={<button>Submit</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trip 42');
    expect(screen.getByText('Madrid → Lisbon')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
