import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrganizationsScreen } from './OrganizationsScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useOrganizationsQuery: vi.fn(),
  useOnboardOrganizationMutation: vi.fn(),
  useDeleteOrganizationMutation: vi.fn(),
  usePermissions: vi.fn(),
  useScopeContext: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Globe: () => null,
  Plus: () => null,
  Trash2: () => null,
  ChevronRight: () => null,
  Building: () => null,
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
  useOrganizationsQuery,
  useOnboardOrganizationMutation,
  useDeleteOrganizationMutation,
  usePermissions,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useOnboardOrganizationMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteOrganizationMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null, setActiveCompanyId: vi.fn() });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <OrganizationsScreen />
    </MemoryRouter>,
  );

describe('OrganizationsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Organizaciones heading', () => {
    renderScreen();
    expect(screen.getByText('Organizaciones')).toBeInTheDocument();
  });

  it('renders create organization button when user has permission', () => {
    renderScreen();
    expect(screen.getByText(/nueva organización/i)).toBeInTheDocument();
  });

  it('does not show create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByText(/nueva organización/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no organizations', () => {
    renderScreen();
    expect(screen.getByText(/no hay organizaciones/i)).toBeInTheDocument();
  });

  it('renders organization list when organizations exist', () => {
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString() }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText(/cargando organizaciones/i)).toBeInTheDocument();
  });

  it('shows active company banner when activeCompanyId is set', () => {
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({
      activeCompanyId: 'o1',
      setActiveCompanyId: vi.fn(),
    });
    (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'o1', name: 'Acme Corp', createdAt: new Date().toISOString() }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText(/viendo datos de la organización seleccionada/i)).toBeInTheDocument();
  });
});
