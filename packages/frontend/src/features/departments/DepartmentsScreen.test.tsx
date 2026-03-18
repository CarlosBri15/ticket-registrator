import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows "Selecciona una organización" when companyId is null', () => {
    (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: null });
    renderScreen();
    expect(screen.getByText(/selecciona una organización/i)).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText(/cargando departamentos/i)).toBeInTheDocument();
  });

  it('shows "Sin resultados" when search has no matches', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'xyz' } });
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  it('opens create modal when Nuevo Departamento is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText(/nuevo departamento/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    // buttons: [0]=Nuevo Departamento, [1]=edit for d1, [2]=delete for d1
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editar Departamento')).toBeInTheDocument();
  });

  it('calls delete mutate when delete button is clicked', () => {
    const mockDelete = vi.fn();
    (useDeleteDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockDelete });
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    // find all buttons and click the delete one (last button in the row)
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[buttons.length - 1];
    fireEvent.click(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith('d1');
  });

  it('uses scope.companyId when not global', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: false, scope: { companyId: 'company-from-scope' } });
    renderScreen();
    // Should render without "Selecciona una organización"
    expect(screen.queryByText(/selecciona una organización/i)).not.toBeInTheDocument();
  });
});
