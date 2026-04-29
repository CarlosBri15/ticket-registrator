import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DepartmentsScreen } from './DepartmentsScreen';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../components/DepartmentModal', () => ({
  DepartmentModal: ({ isOpen, onClose, department }: any) =>
    isOpen
      ? (
        <dialog open>
          <h2>{department ? 'Editar Departamento' : 'Nuevo Departamento'}</h2>
          <button onClick={onClose}>Cerrar</button>
        </dialog>
      )
      : null,
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useDepartmentsQuery: vi.fn(),
    useDeleteDepartmentMutation: vi.fn(),
    usePermissions: vi.fn(),
    useScope: vi.fn(),
    useScopeContext: vi.fn(),
    useCompanyScope: vi.fn(),
  };
});

vi.mock('../../../components/ui/Pagination', () => ({
  Pagination: () => null,
}));

import {
  useDepartmentsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  useScope,
  useScopeContext,
  useCompanyScope,
} from '@ticket-registrator/shared';

const setupMocks = () => {
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
  (useDeleteDepartmentMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
  (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isGlobal: true, scope: {} });
  (useScopeContext as ReturnType<typeof vi.fn>).mockReturnValue({ activeCompanyId: 'company-1' });
  (useCompanyScope as ReturnType<typeof vi.fn>).mockReturnValue({ companyId: 'company-1' });
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
    mockNavigate.mockReset();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders the page heading', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('departments.title');
  });

  it('renders search input when there are departments', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByPlaceholderText('departments.searchPlaceholder')).toBeInTheDocument();
  });

  it('renders create department button when user has permission', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: 'departments.new' })).toBeInTheDocument();
  });

  it('does not show create button when user lacks permission', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => false });
    renderScreen();
    expect(screen.queryByRole('button', { name: 'departments.new' })).not.toBeInTheDocument();
  });

  it('shows empty state when no departments', () => {
    renderScreen();
    expect(screen.getByText('departments.empty')).toBeInTheDocument();
  });

  it('renders department list when departments exist', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
  });

  it('shows the org-selection empty when companyId is null', () => {
    (useCompanyScope as ReturnType<typeof vi.fn>).mockReturnValue({ companyId: null });
    renderScreen();
    expect(screen.getByText('departments.selectOrg')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    renderScreen();
    expect(screen.getByText('departments.loading')).toBeInTheDocument();
  });

  it('shows "Sin resultados" when search has no matches', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText('departments.searchPlaceholder'), { target: { value: 'xyz' } });
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('opens create modal when Nuevo Departamento is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'departments.new' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Departamento')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle('Editar'));
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
    fireEvent.click(screen.getByTitle('Eliminar'));
    expect(mockDelete).toHaveBeenCalledWith('d1');
  });

  it('navigates to /departments/:id when row is clicked', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    const rowButton = screen.getByText('Recursos Humanos').closest('button');
    expect(rowButton).toBeTruthy();
    fireEvent.click(rowButton!);
    expect(mockNavigate).toHaveBeenCalledWith('/departments/d1');
  });

  it('edit button click does NOT navigate (stopPropagation)', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 'd1', name: 'Recursos Humanos', companyId: 'c1' }],
      isLoading: false,
    });
    renderScreen();
    fireEvent.click(screen.getByTitle('Editar'));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
