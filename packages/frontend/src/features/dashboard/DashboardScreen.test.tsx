import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardScreen';

// ─── Sub-component stubs ──────────────────────────────────────────────────────

vi.mock('./SuperAdminDashboard', () => ({ SuperAdminGlobalDashboard: () => <div data-testid="global-stats" /> }));
vi.mock('./AdminDashboard', () => ({ AdminDashboard: () => <div data-testid="admin-stats" /> }));
vi.mock('./ControllerDashboard', () => ({ ControllerDashboard: () => <div data-testid="controller-dashboard" /> }));
vi.mock('./RegularDashboard', () => ({ RegularDashboard: () => <div data-testid="regular-dashboard" /> }));

// ─── Shared mock ──────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useReportsQuery: vi.fn(),
    useUserQuery: vi.fn(),
    useTicketsQuery: vi.fn(),
    useUsersQuery: vi.fn(),
    useOrganizationsQuery: vi.fn(),
    useDepartmentsQuery: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
    usePermissions: vi.fn(),
    ReportStatus: {
      SUBMITTED: 'SUBMITTED',
      APPROVED: 'APPROVED',
      CREATED: 'CREATED',
      DECLINED: 'DECLINED',
    },
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import {
  useScope,
  useScopeContext,
  usePermissions,
  useUserQuery,
} from '@ticket-registrator/shared';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const renderScreen = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

// ─── Router tests ─────────────────────────────────────────────────────────────

describe('DashboardPage router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { hierarchy: 99 } });
  });

  it('renders SuperAdminGlobalDashboard when isGlobal and no activeCompanyId', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.getByTestId('global-stats')).toBeInTheDocument();
  });

  it('renders AdminDashboard when can approve_reports and hierarchy is admin', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { hierarchy: 99 } });
    renderScreen();
    expect(screen.getByTestId('admin-stats')).toBeInTheDocument();
  });

  it('renders RegularDashboard when can() returns false', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { hierarchy: 10 } });
    renderScreen();
    expect(screen.getByTestId('regular-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('global-stats')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-stats')).not.toBeInTheDocument();
  });

  it('renders ControllerDashboard when can approve_reports but hierarchy is below admin', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false });
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: (p: string) => p === 'approve_reports' });
    (useUserQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: { hierarchy: 50 } });
    renderScreen();
    expect(screen.getByTestId('controller-dashboard')).toBeInTheDocument();
  });
});
