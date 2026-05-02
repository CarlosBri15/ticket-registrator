/**
 * Smoke tests for `UserDetailScreen` — covers the loading, not-found, and
 * happy-path renders. The screen is heavy (many shared hooks + breadcrumb +
 * sidebar), so we mock the shared hooks at the boundary and stub the visual
 * sub-components. The aim is regression coverage, not exhaustive flow tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserDetailScreen } from './UserDetailScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUsersQuery: vi.fn(),
    useReportsQuery: vi.fn(),
    useRolesQuery: vi.fn(),
    useSystemRolesQuery: vi.fn(),
    useDepartmentsQuery: vi.fn(),
    useUserQuery: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
  };
});

vi.mock('../../reports/components/ReportRow', () => ({
  ReportRow: ({ report }: any) => <div data-testid="report-row">{report.name}</div>,
}));

vi.mock('../../reports/components/ReportCard', () => ({
  ReportCard: ({ report }: any) => <div data-testid="report-card">{report.name}</div>,
}));

vi.mock('../../reports/components/ReportFilterBar', () => ({
  ReportFilterBar: () => <div data-testid="filter-bar" />,
}));

vi.mock('../components/UserDetailIdentity', () => ({
  UserDetailIdentity: ({ user }: any) => <div data-testid="identity">{user.name}</div>,
}));

vi.mock('../components/UserDetailRating', () => ({
  UserDetailRating: () => <div data-testid="rating" />,
}));

vi.mock('../components/UserDetailSidebar', () => ({
  UserDetailSidebar: () => <div data-testid="sidebar" />,
}));

vi.mock('../components/EditUserModal', () => ({
  EditUserModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div role="dialog">
        <button onClick={onClose}>Close edit</button>
      </div>
    ) : null,
}));

import {
  useUsersQuery,
  useReportsQuery,
  useRolesQuery,
  useSystemRolesQuery,
  useDepartmentsQuery,
  useUserQuery,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const USER = {
  id: 'u1',
  name: 'Ana',
  surname: 'García',
  email: 'ana@test.com',
  username: 'ana',
  roleId: 'r1',
  departmentIds: ['d1'],
  companyId: 'c1',
};

const REPORTS = [
  {
    id: 'rep1', name: 'Report 1', status: 'APPROVED',
    user_id: 'u1', requested_amount: 100, approved_amount: 80,
    currency: 'EUR', createdAt: '2024-01-01T00:00:00Z',
    start_date: '2023-01-01', end_date: '2023-01-05',
  },
];

const renderScreen = (userId = 'u1') =>
  render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserDetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );

const setupMocks = (overrides: any = {}) => {
  (useUsersQuery as any).mockReturnValue({ data: [USER], isLoading: false });
  (useReportsQuery as any).mockReturnValue({ data: REPORTS, isLoading: false });
  (useRolesQuery as any).mockReturnValue({ data: [{ id: 'r1', name: 'Admin' }] });
  (useSystemRolesQuery as any).mockReturnValue({ data: [] });
  (useDepartmentsQuery as any).mockReturnValue({
    data: [{ id: 'd1', name: 'Engineering' }],
  });
  (useUserQuery as any).mockReturnValue({ data: { id: 'me', companyId: 'c1' } });
  (useScope as any).mockReturnValue({ isGlobal: false });
  (useScopeContext as any).mockReturnValue({ activeCompanyId: null });
  Object.entries(overrides).forEach(([key, value]) => {
    const map: Record<string, any> = {
      useUsersQuery, useReportsQuery, useRolesQuery, useSystemRolesQuery,
      useDepartmentsQuery, useUserQuery, useScope, useScopeContext,
    };
    if (map[key]) map[key].mockReturnValue(value);
  });
};

describe('UserDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders the user identity once data is loaded', () => {
    renderScreen();
    expect(screen.getByTestId('identity')).toHaveTextContent('Ana');
  });

  it('renders the rating + sidebar widgets', () => {
    renderScreen();
    expect(screen.getByTestId('rating')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('shows a skeleton while data is loading', () => {
    setupMocks({ useUsersQuery: { data: undefined, isLoading: true } });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows the not-found empty state when the user does not exist', () => {
    setupMocks({ useUsersQuery: { data: [], isLoading: false } });
    renderScreen('missing-user');
    expect(screen.getByText(/Usuario no encontrado/i)).toBeInTheDocument();
  });

  it('navigates back to /users when clicking the not-found action', () => {
    setupMocks({ useUsersQuery: { data: [], isLoading: false } });
    renderScreen('missing-user');
    fireEvent.click(screen.getByRole('button', { name: /Volver a Usuarios/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('opens the edit modal when the edit button is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /common\.edit/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders historical report rows when reports exist', () => {
    renderScreen();
    expect(screen.getAllByTestId('report-row').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the filter bar in the history section', () => {
    renderScreen();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
  });
});
