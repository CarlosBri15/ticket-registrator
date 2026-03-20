import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentActivitySection } from './RecentActivitySection';
import { es } from 'date-fns/locale';

vi.mock('../../../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <div data-testid="status-badge">{status}</div>,
}));

vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />,
  ChevronRight: () => <div data-testid="chevron-icon" />,
}));

describe('RecentActivitySection', () => {
  const mockNavigate = vi.fn();
  const mockT = (key: string) => key;
  const mockReports = [
    {
      id: '1',
      name: 'Viaje Madrid',
      status: 'APPROVED',
      end_date: '2024-05-20',
      requested_amount: 100,
      currency: 'EUR',
    },
  ];

  it('renders correctly with reports', () => {
    render(
      <RecentActivitySection
        t={mockT}
        recentCompleted={mockReports}
        navigate={mockNavigate}
        dateLocale={es}
      />
    );
    expect(screen.getByText('home.recentActivity')).toBeInTheDocument();
    expect(screen.getByText('Viaje Madrid')).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    render(
      <RecentActivitySection
        t={mockT}
        recentCompleted={[]}
        navigate={mockNavigate}
        dateLocale={es}
      />
    );
    expect(screen.getByText('trips.noCompletedTrips')).toBeInTheDocument();
  });

  it('navigates to /trips when "common.viewAll" is clicked', () => {
    render(
      <RecentActivitySection
        t={mockT}
        recentCompleted={[]}
        navigate={mockNavigate}
        dateLocale={es}
      />
    );
    fireEvent.click(screen.getByText('common.viewAll'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips');
  });

  it('navigates to report detail when a report is clicked', () => {
    render(
      <RecentActivitySection
        t={mockT}
        recentCompleted={mockReports}
        navigate={mockNavigate}
        dateLocale={es}
      />
    );
    fireEvent.click(screen.getByText('Viaje Madrid'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips/1');
  });
});
