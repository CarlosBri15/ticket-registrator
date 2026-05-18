import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('../../../components/ui/DatePicker', () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <button
      type="button"
      data-testid="date-picker"
      onClick={() => onChange({ from: new Date('2024-01-01'), to: new Date('2024-01-31') })}
    >
      {value ? 'has-range' : placeholder}
    </button>
  ),
}));

import { ReportFilterBar } from './ReportFilterBar';

const renderBar = (overrides: Partial<React.ComponentProps<typeof ReportFilterBar>> = {}) => {
  const props = {
    search: '',
    onSearch: vi.fn(),
    statusFilter: 'ALL',
    onStatus: vi.fn(),
    dateRange: null,
    onDateRange: vi.fn(),
    hasFilters: false,
    onClear: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<ReportFilterBar {...props} />) };
};

describe('ReportFilterBar', () => {
  it('renders search input, date picker and status trigger', () => {
    renderBar();
    expect(screen.getByPlaceholderText('trips.filterSearch')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByText('trips.filterAll')).toBeInTheDocument();
  });

  it('fires onSearch when typing into the search field', () => {
    const { props } = renderBar();
    fireEvent.change(screen.getByPlaceholderText('trips.filterSearch'), {
      target: { value: 'madrid' },
    });
    expect(props.onSearch).toHaveBeenCalledWith('madrid');
  });

  it('shows clear-search button when there is a search value', () => {
    const { props } = renderBar({ search: 'madrid' });
    const clear = screen.getByLabelText('Clear search');
    fireEvent.click(clear);
    expect(props.onSearch).toHaveBeenCalledWith('');
  });

  it('does not render clear-search button when search is empty', () => {
    renderBar();
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('opens the status dropdown and selects an option', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByText('trips.filterAll'));
    const submitted = screen.getByText('status.SUBMITTED');
    fireEvent.click(submitted);
    expect(props.onStatus).toHaveBeenCalledWith('SUBMITTED');
  });

  it('renders the translated label for the active status', () => {
    renderBar({ statusFilter: 'APPROVED' });
    expect(screen.getByText('status.APPROVED')).toBeInTheDocument();
  });

  it('closes the status dropdown when a click happens outside the popover', () => {
    renderBar();
    fireEvent.click(screen.getByText('trips.filterAll'));
    // The popover renders its options (e.g. status.SUBMITTED) when open.
    expect(screen.getByText('status.SUBMITTED')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('status.SUBMITTED')).not.toBeInTheDocument();
  });

  it('forwards date range changes through onDateRange', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByTestId('date-picker'));
    expect(props.onDateRange).toHaveBeenCalledTimes(1);
    expect(vi.mocked(props.onDateRange).mock.calls[0][0]).toMatchObject({
      from: expect.any(Date),
      to: expect.any(Date),
    });
  });

  it('renders clear-all button when hasFilters is true and triggers onClear', () => {
    const { props } = renderBar({ hasFilters: true });
    const clearAll = screen.getByLabelText('Clear filters');
    fireEvent.click(clearAll);
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it('hides clear-all button when hasFilters is false', () => {
    renderBar({ hasFilters: false });
    expect(screen.queryByLabelText('Clear filters')).not.toBeInTheDocument();
  });
});
