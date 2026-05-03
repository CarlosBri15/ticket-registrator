import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    usePermissions: vi.fn(),
    useScope: vi.fn(),
  };
});

import { usePermissions, useScope } from '@ticket-registrator/shared';
import { SidebarNav } from './SidebarNav';

const renderNav = (overrides: Partial<React.ComponentProps<typeof SidebarNav>> = {}) =>
  render(
    <MemoryRouter>
      <SidebarNav
        isCollapsed={false}
        isGlobalMode={false}
        onNavClick={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  );

describe('SidebarNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({ can: () => true });
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: false });
  });

  it('renders the dashboard link (no permission required)', () => {
    renderNav();
    expect(screen.getByText('layout.dashboard')).toBeInTheDocument();
  });

  it('renders all sections when user has all permissions and not in global mode', () => {
    renderNav();
    expect(screen.getByText('layout.reports')).toBeInTheDocument();
    expect(screen.getByText('layout.allTickets')).toBeInTheDocument();
    expect(screen.getByText('layout.users')).toBeInTheDocument();
    expect(screen.getByText('layout.departments')).toBeInTheDocument();
    expect(screen.getByText('layout.organizations')).toBeInTheDocument();
    expect(screen.getByText('layout.roles')).toBeInTheDocument();
    expect(screen.getByText('layout.permissions')).toBeInTheDocument();
  });

  it('renders section titles when expanded', () => {
    renderNav();
    expect(screen.getByText('layout.sectionPrincipal')).toBeInTheDocument();
    expect(screen.getByText('layout.management')).toBeInTheDocument();
    expect(screen.getByText('layout.sectionAdmin')).toBeInTheDocument();
  });

  it('hides section titles when collapsed', () => {
    renderNav({ isCollapsed: true });
    expect(screen.queryByText('layout.sectionPrincipal')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.management')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.sectionAdmin')).not.toBeInTheDocument();
  });

  it('hides company-scoped items when in global mode', () => {
    renderNav({ isGlobalMode: true });
    expect(screen.queryByText('layout.reports')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.allTickets')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.users')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.departments')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.roles')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.permissions')).not.toBeInTheDocument();
    // Organizations is allowed in global mode
    expect(screen.getByText('layout.organizations')).toBeInTheDocument();
  });

  it('hides Users link when scope is self', () => {
    (useScope as ReturnType<typeof vi.fn>).mockReturnValue({ isSelf: true });
    renderNav();
    expect(screen.queryByText('layout.users')).not.toBeInTheDocument();
  });

  it('hides items the user does not have permission for', () => {
    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
      can: (perm: string) => perm === 'view_reports',
    });
    renderNav();
    expect(screen.getByText('layout.reports')).toBeInTheDocument();
    expect(screen.queryByText('layout.users')).not.toBeInTheDocument();
    expect(screen.queryByText('layout.departments')).not.toBeInTheDocument();
  });

  it('fires onNavClick when a navigation link is clicked', () => {
    const onNavClick = vi.fn();
    renderNav({ onNavClick });
    fireEvent.click(screen.getByText('layout.dashboard'));
    expect(onNavClick).toHaveBeenCalled();
  });

  it('renders no inline labels in collapsed mode (only icons + tooltips)', () => {
    const { container } = renderNav({ isCollapsed: true });
    // Inline labels are <span class="truncate ..."> — those should not be rendered when collapsed.
    const inlineLabel = Array.from(container.querySelectorAll('span.truncate')).find(
      (s) => s.textContent === 'layout.dashboard',
    );
    expect(inlineLabel).toBeUndefined();
  });

  it('uses the kit .sb-item class on each nav entry', () => {
    const { container } = renderNav();
    const items = container.querySelectorAll('.sb-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('marks the active route with .active modifier', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <SidebarNav isCollapsed={false} isGlobalMode={false} onNavClick={vi.fn()} />
      </MemoryRouter>,
    );
    const active = container.querySelector('.sb-item.active');
    expect(active).not.toBeNull();
  });
});
