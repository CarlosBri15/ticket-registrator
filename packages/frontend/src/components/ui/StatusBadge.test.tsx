import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.replace('status.', ''),
  }),
}));

describe('StatusBadge', () => {
  const STATUSES = ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', 'DECLINED'];

  it.each(STATUSES)('renders %s status badge', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it('is case-insensitive (lowercase input)', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('falls back to DRAFT config for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    // Should not throw and should render something
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  it('renders with sm size by default', () => {
    const { container } = render(<StatusBadge status="APPROVED" />);
    expect(container.querySelector('span')?.className).toContain('text-[10px]');
  });

  it('renders with md size when specified', () => {
    const { container } = render(<StatusBadge status="APPROVED" size="md" />);
    expect(container.querySelector('span')?.className).toContain('text-xs');
  });

  it('shows pulse animation for PENDING status', () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('does not show pulse animation for APPROVED status', () => {
    const { container } = render(<StatusBadge status="APPROVED" />);
    expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
  });
});
