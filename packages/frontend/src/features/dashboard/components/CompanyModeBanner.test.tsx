import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('lucide-react', () => ({
  Building2: () => <svg data-testid="icon-building2" />,
  ArrowUpRight: () => <svg data-testid="icon-arrow-up-right" />,
  Globe: () => <svg data-testid="icon-globe" />,
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { CompanyModeBanner } from './CompanyModeBanner';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompanyModeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  const defaultProps = {
    orgName: 'Acme Corp',
    onExit: vi.fn(),
    onDetail: vi.fn(),
  };

  it('renders orgName', () => {
    render(<CompanyModeBanner {...defaultProps} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders "Modo empresa" label', () => {
    render(<CompanyModeBanner {...defaultProps} />);
    expect(screen.getByText('Modo empresa')).toBeInTheDocument();
  });

  it('calls onExit when "Vista global" button clicked', () => {
    const onExit = vi.fn();
    render(<CompanyModeBanner {...defaultProps} onExit={onExit} />);
    fireEvent.click(screen.getByTestId('company-mode-exit'));
    expect(onExit).toHaveBeenCalled();
  });

  it('calls onDetail when "Detalle" button clicked', () => {
    const onDetail = vi.fn();
    render(<CompanyModeBanner {...defaultProps} onDetail={onDetail} />);
    fireEvent.click(screen.getByText('Detalle'));
    expect(onDetail).toHaveBeenCalled();
  });

  it('has data-testid="company-mode-banner"', () => {
    render(<CompanyModeBanner {...defaultProps} />);
    expect(screen.getByTestId('company-mode-banner')).toBeInTheDocument();
  });

  it('has data-testid="company-mode-exit" on Vista global button', () => {
    render(<CompanyModeBanner {...defaultProps} />);
    const btn = screen.getByTestId('company-mode-exit');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Vista global');
  });
});
