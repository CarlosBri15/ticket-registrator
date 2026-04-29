import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { SidebarHeader } from './SidebarHeader';

const baseProps = {
  isCollapsed: false,
  onCollapse: vi.fn(),
  onExpand: vi.fn(),
  onCloseMobile: vi.fn(),
};

describe('SidebarHeader', () => {
  it('renders the app name and tagline when expanded', () => {
    render(<SidebarHeader {...baseProps} />);
    expect(screen.getByText('layout.appName')).toBeInTheDocument();
    expect(screen.getByText('layout.appTagline')).toBeInTheDocument();
  });

  it('hides the app name and tagline when collapsed', () => {
    render(<SidebarHeader {...baseProps} isCollapsed />);
    expect(screen.queryByText('layout.appName')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.appTagline')).not.toBeInTheDocument();
  });

  it('renders the collapse button when expanded', () => {
    render(<SidebarHeader {...baseProps} />);
    expect(screen.getByTitle('layout.collapseMenu')).toBeInTheDocument();
  });

  it('renders the expand button only when collapsed', () => {
    const { rerender } = render(<SidebarHeader {...baseProps} />);
    expect(screen.queryByTitle('layout.expandMenu')).not.toBeInTheDocument();
    rerender(<SidebarHeader {...baseProps} isCollapsed />);
    expect(screen.getByTitle('layout.expandMenu')).toBeInTheDocument();
  });

  it('fires onCollapse when collapse button is clicked', () => {
    const onCollapse = vi.fn();
    render(<SidebarHeader {...baseProps} onCollapse={onCollapse} />);
    fireEvent.click(screen.getByTitle('layout.collapseMenu'));
    expect(onCollapse).toHaveBeenCalled();
  });

  it('fires onExpand when expand button is clicked', () => {
    const onExpand = vi.fn();
    render(<SidebarHeader {...baseProps} isCollapsed onExpand={onExpand} />);
    fireEvent.click(screen.getByTitle('layout.expandMenu'));
    expect(onExpand).toHaveBeenCalled();
  });

  it('fires onCloseMobile when the mobile X button is clicked', () => {
    const onCloseMobile = vi.fn();
    const { container } = render(<SidebarHeader {...baseProps} onCloseMobile={onCloseMobile} />);
    const mobileBtn = container.querySelector('button.lg\\:hidden') as HTMLButtonElement;
    expect(mobileBtn).toBeTruthy();
    fireEvent.click(mobileBtn);
    expect(onCloseMobile).toHaveBeenCalled();
  });
});
