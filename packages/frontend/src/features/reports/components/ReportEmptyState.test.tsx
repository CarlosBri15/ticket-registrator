import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { ReportEmptyState } from './ReportEmptyState';

describe('ReportEmptyState', () => {
  it('renders title and description', () => {
    render(<ReportEmptyState title="No reports yet" description="Create your first one" />);
    expect(screen.getByText('No reports yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first one')).toBeInTheDocument();
  });

  it('does not render the action button when onAction is missing', () => {
    render(<ReportEmptyState title="t" description="d" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the action button when onAction and actionLabel are provided', () => {
    const onAction = vi.fn();
    render(
      <ReportEmptyState
        title="t"
        description="d"
        onAction={onAction}
        actionLabel="Create report"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Create report/i }));
    expect(onAction).toHaveBeenCalled();
  });

  it('does not render the clear-filters button when filtered=false', () => {
    render(
      <ReportEmptyState title="t" description="d" filtered={false} onClear={vi.fn()} />,
    );
    expect(screen.queryByText('trips.filterClearAll')).not.toBeInTheDocument();
  });

  it('renders the clear-filters button when filtered=true and onClear is provided', () => {
    const onClear = vi.fn();
    render(<ReportEmptyState title="t" description="d" filtered onClear={onClear} />);
    fireEvent.click(screen.getByText('trips.filterClearAll'));
    expect(onClear).toHaveBeenCalled();
  });

  it('does not render clear-filters when filtered=true but onClear is missing', () => {
    render(<ReportEmptyState title="t" description="d" filtered />);
    expect(screen.queryByText('trips.filterClearAll')).not.toBeInTheDocument();
  });

  it('does not render the action button when actionLabel is missing', () => {
    render(<ReportEmptyState title="t" description="d" onAction={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
