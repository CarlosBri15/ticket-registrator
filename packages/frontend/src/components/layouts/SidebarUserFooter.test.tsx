import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { SidebarUserFooter } from './SidebarUserFooter';

const userBase = {
  id: 'u1',
  name: 'Ada Lovelace',
  surname: 'Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  roleId: 'r1',
  roleName: 'Admin',
  hierarchy: 99,
  permissions: [],
} as any;

const renderFooter = (overrides: Partial<React.ComponentProps<typeof SidebarUserFooter>> = {}) =>
  render(
    <MemoryRouter>
      <SidebarUserFooter user={userBase} isCollapsed={false} onLogout={vi.fn()} {...overrides} />
    </MemoryRouter>,
  );

describe('SidebarUserFooter', () => {
  it('renders the user name and role when expanded', () => {
    renderFooter();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders user initials in the avatar', () => {
    renderFooter();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('falls back to default user label when user has no name', () => {
    renderFooter({ user: { ...userBase, name: undefined } });
    expect(screen.getByText('layout.defaultUser')).toBeInTheDocument();
  });

  it('hides the user details when collapsed', () => {
    renderFooter({ isCollapsed: true });
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('hides the role badge when user has no roleName', () => {
    renderFooter({ user: { ...userBase, roleName: undefined } });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders the settings link to /settings', () => {
    renderFooter();
    const settingsLink = screen.getByTitle('settings.title') as HTMLAnchorElement;
    expect(settingsLink.getAttribute('href')).toBe('/settings');
  });

  it('renders the logout button and fires onLogout', () => {
    const onLogout = vi.fn();
    renderFooter({ onLogout });
    fireEvent.click(screen.getByTitle('settings.logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  it('hides text labels next to settings/logout when collapsed', () => {
    renderFooter({ isCollapsed: true });
    // The settings.title text appears as title attribute but not as visible label
    const visibleSettings = screen.queryAllByText('settings.title');
    expect(visibleSettings.length).toBe(0);
  });
});
