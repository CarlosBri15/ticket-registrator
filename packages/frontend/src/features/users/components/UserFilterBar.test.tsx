import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { UserFilterBar } from './UserFilterBar';

const renderBar = (overrides: Partial<React.ComponentProps<typeof UserFilterBar>> = {}) => {
  const props = {
    search: '',
    onSearch: vi.fn(),
    hasFilters: false,
    onClear: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<UserFilterBar {...props} />) };
};

describe('UserFilterBar', () => {
  it('renders the search input with placeholder', () => {
    renderBar();
    expect(screen.getByPlaceholderText('users.searchPlaceholder')).toBeInTheDocument();
  });

  it('fires onSearch when typing', () => {
    const { props } = renderBar();
    fireEvent.change(screen.getByPlaceholderText('users.searchPlaceholder'), {
      target: { value: 'ada' },
    });
    expect(props.onSearch).toHaveBeenCalledWith('ada');
  });

  it('hides the clear-all button when hasFilters is false', () => {
    renderBar();
    expect(screen.queryByText('trips.filterClearAll')).not.toBeInTheDocument();
  });

  it('renders the clear-all button when hasFilters is true', () => {
    renderBar({ hasFilters: true });
    expect(screen.getByText('trips.filterClearAll')).toBeInTheDocument();
  });

  it('fires onClear when the clear-all button is clicked', () => {
    const { props } = renderBar({ hasFilters: true });
    fireEvent.click(screen.getByText('trips.filterClearAll'));
    expect(props.onClear).toHaveBeenCalled();
  });
});
