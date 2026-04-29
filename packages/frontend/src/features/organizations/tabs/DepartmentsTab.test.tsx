import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('../../../hooks/useDateLocale', () => ({
  useDateLocale: () => undefined,
}));

import type { IDepartment } from '@ticket-registrator/shared';
import { DepartmentsTab } from './DepartmentsTab';

const dept = (overrides: Partial<IDepartment> = {}): IDepartment => ({
  id: 'd1',
  name: 'Engineering',
  companyId: 'c1',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

const baseProps = {
  loading: false,
  filtered: [dept()],
  search: '',
  onSearch: vi.fn(),
  onCreate: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  canCreate: true,
  canEdit: true,
  canDelete: true,
};

describe('DepartmentsTab', () => {
  it('renders the loading spinner when loading=true', () => {
    const { container } = render(<DepartmentsTab {...baseProps} loading filtered={[]} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the empty state when filtered list is empty', () => {
    render(<DepartmentsTab {...baseProps} filtered={[]} />);
    expect(screen.getByText('departments.empty')).toBeInTheDocument();
  });

  it('shows the no-results empty state when searching with no matches', () => {
    render(<DepartmentsTab {...baseProps} filtered={[]} search="abc" />);
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('renders department rows with their name', () => {
    render(<DepartmentsTab {...baseProps} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders the Create button when canCreate is true', () => {
    render(<DepartmentsTab {...baseProps} />);
    expect(screen.getByRole('button', { name: /departments\.new/ })).toBeInTheDocument();
  });

  it('hides the Create button when canCreate is false', () => {
    render(<DepartmentsTab {...baseProps} canCreate={false} />);
    expect(screen.queryByRole('button', { name: /departments\.new/ })).not.toBeInTheDocument();
  });

  it('fires onCreate when the Create button is clicked', () => {
    const onCreate = vi.fn();
    render(<DepartmentsTab {...baseProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: /departments\.new/ }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('fires onSearch when the search input changes', () => {
    const onSearch = vi.fn();
    render(<DepartmentsTab {...baseProps} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText('departments.searchPlaceholder'), {
      target: { value: 'eng' },
    });
    expect(onSearch).toHaveBeenCalledWith('eng');
  });

  it('fires onEdit when the edit button is clicked', () => {
    const onEdit = vi.fn();
    const d = dept();
    render(<DepartmentsTab {...baseProps} filtered={[d]} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('common.edit'));
    expect(onEdit).toHaveBeenCalledWith(d);
  });

  it('fires onDelete with the department id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<DepartmentsTab {...baseProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('common.delete'));
    expect(onDelete).toHaveBeenCalledWith('d1');
  });

  it('hides edit button when canEdit is false', () => {
    render(<DepartmentsTab {...baseProps} canEdit={false} />);
    expect(screen.queryByTitle('common.edit')).not.toBeInTheDocument();
  });

  it('hides delete button when canDelete is false', () => {
    render(<DepartmentsTab {...baseProps} canDelete={false} />);
    expect(screen.queryByTitle('common.delete')).not.toBeInTheDocument();
  });
});
