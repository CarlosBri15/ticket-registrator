import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportsScreen } from './ReportsScreen';

vi.mock('@ticket-registrator/shared', () => ({
  useReportsQuery: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Plus: () => null,
  Calendar: () => null,
  ArrowUpRight: () => null,
  Clock: () => null,
  CheckCircle: () => null,
  Plane: () => null,
  Wallet: () => null,
  ChevronRight: () => null,
  BarChart3: () => null,
  MapPin: () => null,
  Search: () => null,
  X: () => null,
  Filter: () => null,
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

vi.mock('./components/ReportForm', () => ({
  ReportForm: () => <div>report-form</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

import { useReportsQuery } from '@ticket-registrator/shared';

const setupMocks = () => {
  (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
};

const renderScreen = () =>
  render(
    <MemoryRouter>
      <ReportsScreen />
    </MemoryRouter>,
  );

describe('ReportsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderScreen();
    expect(container).toBeTruthy();
  });

  it('renders Viajes heading', () => {
    renderScreen();
    expect(screen.getByText('trips.title')).toBeInTheDocument();
  });

  it('renders new report button', () => {
    renderScreen();
    expect(screen.getByText('trips.newTripTitle')).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    renderScreen();
    expect(screen.getByText('trips.noTickets')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = renderScreen();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders report card when reports exist', () => {
    (useReportsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{
        id: 'r1', name: 'Viaje Madrid', status: 'CREATED',
        start_date: '2024-01-01', end_date: '2024-01-05',
        approved_amount: null, destination: 'Madrid',
      }],
      isLoading: false,
    });
    renderScreen();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });
});
