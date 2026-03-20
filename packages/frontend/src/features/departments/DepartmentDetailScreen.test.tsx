import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DepartmentDetailScreen } from './DepartmentDetailScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock('@ticket-registrator/shared', () => ({
  useDepartmentsQuery: vi.fn(),
  useUsersQuery: vi.fn(),
  useReportsQuery: vi.fn(),
  useDeleteDepartmentMutation: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
  useUserQuery: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  ChevronLeft: () => null,
  Layers: () => null,
  UserCircle: () => null,
  Pencil: () => null,
  Trash2: () => null,
  ArrowRight: () => null,
  Plane: () => null,
}));

vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));

vi.mock('./DepartmentModal', () => ({
  DepartmentModal: ({ isOpen, onClose }: any) =>
    isOpen ? <div role="dialog"><button onClick={onClose}>Cerrar</button></div> : null,
}));

import {
  useDepartmentsQuery,
  useUsersQuery,
  useReportsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  useScope,
  useScopeContext,
  useUserQuery,
} from '@ticket-registrator/shared';

const DEPT = { id: 'd1', name: 'Engineering', companyId: 'c1' };
const USERS = [
  { id: 'u1', name: 'Ana', surname: 'García', email: 'ana@test.com', username: 'ana', roleId: 'r1', departmentIds: ['d1'] },
  { id: 'u2', name: 'Bob', surname: 'Smith', email: 'bob@test.com', username: 'bob', roleId: 'r1', departmentIds: [] },
];
const REPORTS = [
  { id: 'rep1', name: 'Report 1', status: 'PENDING', user_id: 'u1', requested_amount: 100, createdAt: '2024-01-01T00:00:00Z', currency: 'EUR' },
];

const setupMocks = (overrides: any = {}) => {
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [DEPT], isLoading: false });
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: USERS, isLoading: false });
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: REPORTS, isLoading: false });
  (useDeleteDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'c1' });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { companyId: 'c1' } });
  Object.entries(overrides).forEach(([key, value]) => {
    const mockMap: any = {
      useDepartmentsQuery,
      useUsersQuery,
      useReportsQuery,
      useDeleteDepartmentMutation,
      usePermissions,
      useScope,
      useScopeContext,
      useUserQuery,
    };
    if (mockMap[key]) (mockMap[key] as ReturnType<typeof vi.fn>).mockReturnValue(value);
  });
};

const renderScreen = (deptId = 'd1') =>
  render(
    <MemoryRouter initialEntries={[`/departments/${deptId}`]}>
      <Routes>
        <Route path="/departments/:id" element={<DepartmentDetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );

describe('DepartmentDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    setupMocks();
  });

  it('renders department name', () => {
    renderScreen();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    setupMocks({ useDepartmentsQuery: { data: undefined, isLoading: true } });
    renderScreen();
    // Loading state shows skeleton (animate-pulse div)
    const { container } = render(
      <MemoryRouter initialEntries={['/departments/d1']}>
        <Routes>
          <Route path="/departments/:id" element={<DepartmentDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows not found when dept id not in list', () => {
    renderScreen('nonexistent-id');
    expect(screen.getByText(/departamento no encontrado/i)).toBeInTheDocument();
  });

  it('shows member list', () => {
    renderScreen();
    // Ana García is a member of d1
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    // Bob Smith is not a member of d1
    expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
  });

  it('navigates to /users/:id when member clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Ana García').closest('button')!);
    expect(mockNavigate).toHaveBeenCalledWith('/users/u1');
  });

  it('navigates to /departments when back button clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Departamentos'));
    expect(mockNavigate).toHaveBeenCalledWith('/departments');
  });

  it('shows empty members state', () => {
    setupMocks({ useUsersQuery: { data: [USERS[1]], isLoading: false } });
    renderScreen();
    expect(screen.getByText(/sin miembros/i)).toBeInTheDocument();
  });

  it('shows reports in department', () => {
    renderScreen();
    expect(screen.getByText('Report 1')).toBeInTheDocument();
  });

  it('navigates to /trips/:id when report clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Report 1').closest('button')!);
    expect(mockNavigate).toHaveBeenCalledWith('/trips/rep1');
  });

  it('shows edit button when has permission', () => {
    renderScreen();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('does not show edit button when lacks permission', () => {
    setupMocks({ usePermissions: { can: (perm: string) => perm !== 'edit_departments' } });
    renderScreen();
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('calls delete mutation when delete button clicked', () => {
    const mockDelete = vi.fn();
    setupMocks({ useDeleteDepartmentMutation: { mutate: mockDelete } });
    renderScreen();
    fireEvent.click(screen.getByTestId('delete-button'));
    expect(mockDelete).toHaveBeenCalledWith('d1', expect.any(Object));
  });
});
