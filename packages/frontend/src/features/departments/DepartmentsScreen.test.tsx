import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DepartmentsScreen } from './DepartmentsScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useDepartmentsQuery: vi.fn(),
  useCreateDepartmentMutation: vi.fn(),
  useUpdateDepartmentMutation: vi.fn(),
  useDeleteDepartmentMutation: vi.fn(),
  usePermissions: vi.fn(),
  useScope: vi.fn(),
  useScopeContext: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Layers: () => null,
  Search: () => null,
  Plus: () => null,
  Trash2: () => null,
  Pencil: () => null,
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
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  usePermissions,
  useScope,
  useScopeContext,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useCreateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useUpdateDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useDeleteDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <DepartmentsScreen />
    </MemoryRouter>,
  );

describe('DepartmentsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Departamentos heading', () => {
    renderScreen();
    expect(screen.getByText('Departamentos')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderScreen();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('renders create department button when user has permission', () => {
    renderScreen();
    expect(screen.getByText(/nuevo departamento/i)).toBeInTheDocument();
  });

  it('does not show create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByText(/nuevo departamento/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no departments', () => {
    renderScreen();
    expect(screen.getByText(/no hay departamentos/i)).toBeInTheDocument();
  });

  it('renders department list when departments exist', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
  });
});
