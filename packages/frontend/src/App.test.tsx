import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Mock heavy providers / screens
vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    ScopeProvider: ({ children }: any) => <>{children}</>,
    useUserQuery: vi.fn().mockReturnValue({ data: null }),
    usePermissions: vi.fn().mockReturnValue({ can: () => false }),
  };
});

vi.mock('./router/PrivateRoute', () => ({
  PrivateRoute: ({ children }: any) => <>{children}</>,
}));

vi.mock('./components/layouts/AppLayout', () => ({
  AppLayout: () => <div data-testid="app-layout" />,
}));

vi.mock('./features/auth/screens/LoginScreen', () => ({
  LoginForm: () => <div>login</div>,
}));
vi.mock('./features/auth/screens/RegisterScreen', () => ({
  RegisterForm: () => <div>register</div>,
}));
vi.mock('./features/dashboard/screens/DashboardScreen', () => ({
  DashboardPage: () => <div>dashboard</div>,
}));
vi.mock('./features/reports/screens/ReportsScreen', () => ({
  ReportsScreen: () => <div>reports</div>,
}));
vi.mock('./features/reports/screens/ReportDetailScreen', () => ({
  ReportDetailScreen: () => <div>report-detail</div>,
}));
vi.mock('./features/tickets/screens/TicketsScreen', () => ({
  AllTicketsScreen: () => <div>tickets</div>,
}));
vi.mock('./features/settings/screens/SettingsScreen', () => ({
  SettingsScreen: () => <div>settings</div>,
}));
vi.mock('./features/users/screens/UsersScreen', () => ({
  UsersScreen: () => <div>users</div>,
}));
vi.mock('./features/departments/screens/DepartmentsScreen', () => ({
  DepartmentsScreen: () => <div>departments</div>,
}));
vi.mock('./features/roles/screens/RolesScreen', () => ({
  RolesScreen: () => <div>roles</div>,
}));
vi.mock('./features/organizations/screens/OrganizationsScreen', () => ({
  OrganizationsScreen: () => <div>organizations</div>,
}));
vi.mock('./features/permissions/screens/PermissionsScreen', () => ({
  PermissionsScreen: () => <div>permissions</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
