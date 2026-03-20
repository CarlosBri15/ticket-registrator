import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserDetailScreen } from './UserDetailScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useUsersQuery: vi.fn(),
  useReportsQuery: vi.fn(),
  useRolesQuery: vi.fn(),
  useDepartmentsQuery: vi.fn(),
  useUpdateUserMutation: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
  useUserQuery: vi.fn(),
  usePermissions: vi.fn(),
  ReportStatus: { SUBMITTED: 'Submitted', APPROVED: 'Approved', CREATED: 'Created', DECLINED: 'Declined' },
}));

vi.mock('./EditUserModal', () => ({
  EditUserModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div role="dialog" data-testid="edit-modal">
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('lucide-react', () => ({
  ChevronLeft: () => null,
  UserCircle: () => null,
  Pencil: () => <span data-testid="pencil-icon" />,
  Plane: () => null,
  ArrowRight: () => null,
}));

vi.mock('date-fns', () => ({
  format: (_date: any, _fmt: string) => '01 ene 2024',
}));
vi.mock('date-fns/locale', () => ({ es: {} }));

import {
  useUsersQuery,
  useReportsQuery,
  useRolesQuery,
  useDepartmentsQuery,
  useScope,
  useScopeContext,
  useUserQuery,
} from '@ticket-registrator/shared';

const MOCK_USER = {
  id: 'u1',
  name: 'Ana',
  surname: 'García',
  email: 'ana@test.com',
  username: 'ana.garcia',
  roleId: 'r1',
  companyId: 'company-1',
  departmentIds: ['d1'],
};

const MOCK_ROLES = [{ id: 'r1', name: 'Admin', hierarchy: 99, companyId: 'company-1', description: null }];
const MOCK_DEPARTMENTS = [{ id: 'd1', name: 'Ingeniería', companyId: 'company-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];

const MOCK_REPORTS = [
  {
    id: 'rep1',
    user_id: 'u1',
    name: 'Viaje Madrid',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    currency: 'EUR',
    type: 'business',
    requested_amount: 500,
    approved_amount: 400,
    status: 'Approved',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
  },
  {
    id: 'rep2',
    user_id: 'u1',
    name: 'Viaje Barcelona',
    start_date: '2024-02-01',
    end_date: '2024-02-03',
    currency: 'EUR',
    type: 'business',
    requested_amount: 300,
    approved_amount: 0,
    status: 'Submitted',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-04T00:00:00Z',
  },
];

const setupMocks = () => {
  (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [MOCK_USER], isLoading: false });
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_REPORTS, isLoading: false });
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_ROLES });
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_DEPARTMENTS });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
  (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { id: 'me', companyId: 'company-1' } });
};

const renderScreen = (userId = 'u1') =>
  render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserDetailScreen />} />
        <Route path="/users" element={<div>Users List</div>} />
        <Route path="/trips/:id" element={<div>Trip Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('UserDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders user name', () => {
    renderScreen();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });

  it('renders user email', () => {
    renderScreen();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    renderScreen();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    (useUsersQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    // Skeleton divs are rendered with animate-pulse class
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows not found when user id not in list', () => {
    renderScreen('nonexistent');
    expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    renderScreen();
    expect(screen.getByText(/sin viajes registrados/i)).toBeInTheDocument();
  });

  it('renders report list', () => {
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
    expect(screen.getByText('Viaje Barcelona')).toBeInTheDocument();
  });

  it('navigates to /trips/:id when report is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Viaje Madrid'));
    expect(screen.getByText('Trip Detail')).toBeInTheDocument();
  });

  it('navigates back to /users when back button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Usuarios'));
    expect(screen.getByText('Users List')).toBeInTheDocument();
  });

  it('shows edit button', () => {
    renderScreen();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('edit-button'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('shows department names', () => {
    renderScreen();
    expect(screen.getByText('Ingeniería')).toBeInTheDocument();
  });

  it('shows total trips count', () => {
    renderScreen();
    // Stats section shows "2" for total trips — there may be multiple "2" elements
    const allTwos = screen.getAllByText('2');
    expect(allTwos.length).toBeGreaterThan(0);
  });
});
