import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import type { IUser } from '@ticket-registrator/shared';
import { UsersTab } from './UsersTab';

const user = (overrides: Partial<IUser> = {}): IUser => ({
  id: 'u1',
  name: 'Ada',
  surname: 'Lovelace',
  email: 'ada@example.com',
  username: 'ada',
  roleId: 'r1',
  companyId: 'c1',
  departmentIds: [],
  ...overrides,
});

const baseProps = {
  loading: false,
  filtered: [user()],
  search: '',
  onSearch: vi.fn(),
  onCreate: vi.fn(),
  canCreate: true,
  getRoleName: (id: string) => (id === 'r1' ? 'Admin' : 'Unknown'),
};

describe('UsersTab', () => {
  it('renders the loading spinner when loading=true', () => {
    const { container } = render(<UsersTab {...baseProps} loading filtered={[]} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the empty state when filtered list is empty', () => {
    render(<UsersTab {...baseProps} filtered={[]} />);
    expect(screen.getByText('users.empty')).toBeInTheDocument();
  });

  it('shows the no-results empty state when searching with no matches', () => {
    render(<UsersTab {...baseProps} filtered={[]} search="abc" />);
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('renders user rows with full name, email and username', () => {
    render(<UsersTab {...baseProps} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com · @ada')).toBeInTheDocument();
  });

  it('renders the role name resolved by getRoleName', () => {
    render(<UsersTab {...baseProps} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders the Create button only when canCreate=true', () => {
    const { rerender } = render(<UsersTab {...baseProps} />);
    expect(screen.getByRole('button', { name: /users\.new/ })).toBeInTheDocument();
    rerender(<UsersTab {...baseProps} canCreate={false} />);
    expect(screen.queryByRole('button', { name: /users\.new/ })).not.toBeInTheDocument();
  });

  it('fires onCreate when the Create button is clicked', () => {
    const onCreate = vi.fn();
    render(<UsersTab {...baseProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: /users\.new/ }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('fires onSearch when typing in the search field', () => {
    const onSearch = vi.fn();
    render(<UsersTab {...baseProps} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText('users.searchPlaceholder'), {
      target: { value: 'ada' },
    });
    expect(onSearch).toHaveBeenCalledWith('ada');
  });
});
