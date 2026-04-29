import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
    i18n: { language: 'en' },
  }),
}));

import { UserDetailSidebar } from './UserDetailSidebar';

describe('UserDetailSidebar', () => {
  it('renders total reports count', () => {
    render(<UserDetailSidebar totalReports={42} avgApproved="100" userId="u1" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total reportes')).toBeInTheDocument();
  });

  it('renders average approved value', () => {
    render(<UserDetailSidebar totalReports={0} avgApproved="125.5" userId="u1" />);
    expect(screen.getByText('125.5')).toBeInTheDocument();
    expect(screen.getByText('Promedio aprobado')).toBeInTheDocument();
    expect(screen.getByText('Por reporte')).toBeInTheDocument();
  });

  it('renders the user ID in a code element', () => {
    render(<UserDetailSidebar totalReports={0} avgApproved="0" userId="user-uuid-abc" />);
    expect(screen.getByText('user-uuid-abc').tagName).toBe('CODE');
  });

  it('renders the active account banner', () => {
    render(<UserDetailSidebar totalReports={0} avgApproved="0" userId="u1" />);
    expect(screen.getByRole('heading', { name: 'Cuenta activa' })).toBeInTheDocument();
  });

  it('renders zero values without errors', () => {
    render(<UserDetailSidebar totalReports={0} avgApproved="0" userId="u1" />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });
});
