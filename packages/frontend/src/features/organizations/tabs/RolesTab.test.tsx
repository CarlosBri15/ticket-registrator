import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import type { IRole } from '@ticket-registrator/shared';
import { RolesTab } from './RolesTab';

const role = (overrides: Partial<IRole> = {}): IRole => ({
  id: 'r1',
  name: 'Admin',
  hierarchy: 99,
  description: 'Top-level access',
  companyId: 'c1',
  ...overrides,
});

const baseProps = {
  loading: false,
  roles: [role()],
  search: '',
  onSearch: vi.fn(),
  onCreate: vi.fn(),
  canCreate: true,
  onAssignPermissions: vi.fn(),
  canManagePermissions: true,
};

describe('RolesTab', () => {
  it('renders the loading spinner when loading=true', () => {
    const { container } = render(<RolesTab {...baseProps} loading roles={[]} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the empty state when roles list is empty', () => {
    render(<RolesTab {...baseProps} roles={[]} />);
    expect(screen.getByText('roles.empty')).toBeInTheDocument();
  });

  it('shows the no-results empty state when searching with no matches', () => {
    render(<RolesTab {...baseProps} roles={[role({ name: 'Manager' })]} search="xxx" />);
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('renders roles whose name matches the search (case-insensitive)', () => {
    const roles = [role({ name: 'Manager' }), role({ id: 'r2', name: 'Admin' })];
    render(<RolesTab {...baseProps} roles={roles} search="man" />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders the role description when set', () => {
    render(<RolesTab {...baseProps} />);
    expect(screen.getByText('Top-level access')).toBeInTheDocument();
  });

  it('renders the hierarchy label and number', () => {
    render(<RolesTab {...baseProps} />);
    expect(screen.getByText(/Admin · 99/)).toBeInTheDocument();
  });

  it('renders the Create button only when canCreate=true', () => {
    const { rerender } = render(<RolesTab {...baseProps} canCreate />);
    expect(screen.getByRole('button', { name: /roles\.new/ })).toBeInTheDocument();
    rerender(<RolesTab {...baseProps} canCreate={false} />);
    expect(screen.queryByRole('button', { name: /roles\.new/ })).not.toBeInTheDocument();
  });

  it('fires onCreate when the Create button is clicked', () => {
    const onCreate = vi.fn();
    render(<RolesTab {...baseProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: /roles\.new/ }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('fires onSearch when typing in the search field', () => {
    const onSearch = vi.fn();
    render(<RolesTab {...baseProps} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText('roles.searchPlaceholder'), {
      target: { value: 'admin' },
    });
    expect(onSearch).toHaveBeenCalledWith('admin');
  });

  it('renders the manage-permissions button only when canManagePermissions=true', () => {
    const { rerender } = render(<RolesTab {...baseProps} />);
    expect(screen.getByTitle('roles.managePermissions')).toBeInTheDocument();
    rerender(<RolesTab {...baseProps} canManagePermissions={false} />);
    expect(screen.queryByTitle('roles.managePermissions')).not.toBeInTheDocument();
  });

  it('fires onAssignPermissions with the role id when manage-permissions is clicked', () => {
    const onAssignPermissions = vi.fn();
    render(<RolesTab {...baseProps} onAssignPermissions={onAssignPermissions} />);
    fireEvent.click(screen.getByTitle('roles.managePermissions'));
    expect(onAssignPermissions).toHaveBeenCalledWith('r1');
  });
});
