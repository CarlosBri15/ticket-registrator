import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { SidebarModeIndicator } from './SidebarModeIndicator';

const baseProps = {
  isGlobalMode: false,
  isCompanyMode: false,
  isCollapsed: false,
  orgName: 'Acme',
  onExitCompanyMode: vi.fn(),
};

describe('SidebarModeIndicator', () => {
  it('renders nothing when neither global nor company mode is active', () => {
    const { container } = render(<SidebarModeIndicator {...baseProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the global mode indicator when isGlobalMode and not collapsed', () => {
    render(<SidebarModeIndicator {...baseProps} isGlobalMode />);
    expect(screen.getByText('layout.globalModeIndicator')).toBeInTheDocument();
  });

  it('does not render the global mode indicator when collapsed', () => {
    const { container } = render(<SidebarModeIndicator {...baseProps} isGlobalMode isCollapsed />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the company banner with org name when not collapsed', () => {
    render(<SidebarModeIndicator {...baseProps} isCompanyMode />);
    expect(screen.getByTestId('sidebar-company-banner')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('layout.companyModeActive')).toBeInTheDocument();
  });

  it('renders only the layers icon button when company mode is collapsed', () => {
    render(<SidebarModeIndicator {...baseProps} isCompanyMode isCollapsed />);
    expect(screen.queryByTestId('sidebar-company-banner')).not.toBeInTheDocument();
    expect(screen.getByTitle('layout.exitCompanyMode')).toBeInTheDocument();
  });

  it('fires onExitCompanyMode when the X button is clicked (expanded)', () => {
    const onExitCompanyMode = vi.fn();
    render(<SidebarModeIndicator {...baseProps} isCompanyMode onExitCompanyMode={onExitCompanyMode} />);
    fireEvent.click(screen.getByTitle('layout.exitCompanyMode'));
    expect(onExitCompanyMode).toHaveBeenCalled();
  });

  it('fires onExitCompanyMode when the layers button is clicked (collapsed)', () => {
    const onExitCompanyMode = vi.fn();
    render(
      <SidebarModeIndicator
        {...baseProps}
        isCompanyMode
        isCollapsed
        onExitCompanyMode={onExitCompanyMode}
      />,
    );
    fireEvent.click(screen.getByTitle('layout.exitCompanyMode'));
    expect(onExitCompanyMode).toHaveBeenCalled();
  });
});
