import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RolesScreen } from './RolesScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useRolesQuery: vi.fn(),
  useSystemRolesQuery: vi.fn(),
  useCreateRoleMutation: vi.fn(),
  useDeleteRoleMutation: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Shield: () => null,
  Plus: () => null,
  Trash2: () => null,
  Building2: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));
vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

import {
  useRolesQuery,
  useSystemRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  usePermissions,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useSystemRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [] });
  (useCreateRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteRoleMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <RolesScreen />
    </MemoryRouter>,
  );

describe('RolesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Roles heading', () => {
    renderScreen();
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('renders create role button when user has permission', () => {
    renderScreen();
    expect(screen.getByText(/nuevo rol/i)).toBeInTheDocument();
  });

  it('does not show create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByText(/nuevo rol/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no roles', () => {
    renderScreen();
    expect(screen.getByText(/no hay roles/i)).toBeInTheDocument();
  });

  it('renders role list when roles exist', () => {
    (useRolesQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'r1', name: 'Supervisor', hierarchy: 3, description: 'Supervisa el equipo' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
  });
});
