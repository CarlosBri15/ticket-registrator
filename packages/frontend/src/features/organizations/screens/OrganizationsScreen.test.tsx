import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrganizationsScreen } from './OrganizationsScreen';

// ─── Mock react-router-dom navigate ──────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Mock shared hooks ────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useOrganizationsQuery: vi.fn(),
    useOnboardOrganizationMutation: vi.fn(),
    usePermissions: vi.fn(),
  };
});


vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));
vi.mock('../../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('../../../components/ui/Alert', () => ({
  AlertError: ({ message }: any) => <div role="alert">{message}</div>,
  getApiErrorMessage: (e: any) => e?.message ?? 'Error',
}));

import {
  useOrganizationsQuery,
  useOnboardOrganizationMutation,
  usePermissions,
} from '@ticket-registrator/shared';

const now = new Date().toISOString();

const sampleOrgs = [
  { id: 'o1', name: 'Acme Corp', createdAt: now, updatedAt: now },
  { id: 'o2', name: 'Globex Inc', createdAt: now, updatedAt: now },
];

const setupMocks = (overrides: Partial<{
  orgs: any; loading: boolean; canCreate: boolean;
}> = {}) => {
  (useOrganizationsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: overrides.orgs ?? [],
    isLoading: overrides.loading ?? false,
  });
  (useOnboardOrganizationMutation as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: vi.fn(), isPending: false, error: null, reset: vi.fn(),
  });
  const canCreate = overrides.canCreate ?? true;
  (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
    can: (p: string) => p === 'create_company' ? canCreate : true,
  });
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

  // ── Basic rendering ─────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Organizaciones heading', () => {
    renderScreen();
    expect(screen.getByText('Organizaciones')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderScreen();
    expect(screen.getByPlaceholderText(/buscar organización/i)).toBeInTheDocument();
  });

  it('renders "Nueva Organización" button when user has create_company permission', () => {
    setupMocks({ canCreate: true });
    renderScreen();
    expect(screen.getByText(/nueva organización/i)).toBeInTheDocument();
  });

  it('hides "Nueva Organización" button when user lacks create_company permission', () => {
    setupMocks({ canCreate: false });
    renderScreen();
    expect(screen.queryByText(/nueva organización/i)).not.toBeInTheDocument();
  });

  // ── Loading & empty states ──────────────────────────────────────────────────

  it('shows loading spinner while organizations are loading', () => {
    setupMocks({ loading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when there are no organizations', () => {
    setupMocks({ orgs: [] });
    renderScreen();
    expect(screen.getByText(/no hay organizaciones/i)).toBeInTheDocument();
  });

  it('shows empty state message when search has no results', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    const searchInput = screen.getByPlaceholderText(/buscar organización/i);
    fireEvent.change(searchInput, { target: { value: 'zzz-no-match' } });
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  // ── Org cards ────────────────────────────────────────────────────────────────

  it('renders org names as cards', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });

  it('shows org count summary', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    expect(screen.getByText(/2 de 2 organizaciones/i)).toBeInTheDocument();
  });

  it('filters org cards when search is typed', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/buscar organización/i), { target: { value: 'Acme' } });
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.queryByText('Globex Inc')).not.toBeInTheDocument();
  });

  it('clicking an org card navigates to /organizations/:id', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    fireEvent.click(screen.getByText('Acme Corp'));
    expect(mockNavigate).toHaveBeenCalledWith('/organizations/o1');
  });

  it('clicking another org card navigates to its route', () => {
    setupMocks({ orgs: sampleOrgs });
    renderScreen();
    fireEvent.click(screen.getByText('Globex Inc'));
    expect(mockNavigate).toHaveBeenCalledWith('/organizations/o2');
  });

  // ── Onboard Modal ───────────────────────────────────────────────────────────

  it('opens onboard modal when "Nueva Organización" is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText(/nueva organización/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes onboard modal when cancel is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText(/nueva organización/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds a second admin row when "Añadir" is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText(/nueva organización/i));
    fireEvent.click(screen.getByText('Añadir'));
    expect(screen.getByText('Admin 2')).toBeInTheDocument();
  });

  it('removes an admin row when "Quitar" is clicked', () => {
    renderScreen();
    fireEvent.click(screen.getByText(/nueva organización/i));
    fireEvent.click(screen.getByText('Añadir'));
    expect(screen.getByText('Admin 2')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Quitar')[0]);
    expect(screen.queryByText('Admin 2')).not.toBeInTheDocument();
  });

  it('calls onboard mutation when form is submitted with valid data', () => {
    const mockMutate = vi.fn();
    (useOnboardOrganizationMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate, isPending: false, error: null, reset: vi.fn(),
    });
    renderScreen();
    fireEvent.click(screen.getByText(/nueva organización/i));
    fireEvent.change(screen.getByLabelText('Nombre de la empresa *'), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getAllByLabelText('Nombre *')[0], { target: { value: 'Carlos' } });
    fireEvent.change(screen.getAllByLabelText('Apellido *')[0], { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@acme.com' } });
    fireEvent.submit(screen.getByText('Crear Organización').closest('form')!);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ company: expect.objectContaining({ name: 'Acme Corp' }) }),
    );
  });
});
