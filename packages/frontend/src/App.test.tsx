import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Mock heavy providers / screens
vi.mock('@ticket-registrator/shared', () => ({
  ScopeProvider: ({ children }: any) => <>{children}</>,
  useUserQuery: vi.fn().mockReturnValue({ data: null }),
  usePermissions: vi.fn().mockReturnValue({ can: () => false }),
}));

vi.mock('./router/PrivateRoute', () => ({
  PrivateRoute: ({ children }: any) => <>{children}</>,
}));

vi.mock('./layouts/AppLayout', () => ({
  AppLayout: () => <div data-testid="app-layout" />,
}));

vi.mock('./features/auth/LoginScreen', () => ({
  LoginForm: () => <div>login</div>,
}));
vi.mock('./features/auth/RegisterScreen', () => ({
  RegisterForm: () => <div>register</div>,
}));
vi.mock('./features/dashboard/DashboardScreen', () => ({
  DashboardPage: () => <div>dashboard</div>,
}));
vi.mock('./features/reports/ReportsScreen', () => ({
  ReportsScreen: () => <div>reports</div>,
}));
vi.mock('./features/reports/ReportDetailScreen', () => ({
  ReportDetailScreen: () => <div>report-detail</div>,
}));
vi.mock('./features/tickets/TicketsScreen', () => ({
  AllTicketsScreen: () => <div>tickets</div>,
}));
vi.mock('./features/settings/SettingsScreen', () => ({
  SettingsScreen: () => <div>settings</div>,
}));
vi.mock('./features/users/UsersScreen', () => ({
  UsersScreen: () => <div>users</div>,
}));
vi.mock('./features/departments/DepartmentsScreen', () => ({
  DepartmentsScreen: () => <div>departments</div>,
}));
vi.mock('./features/roles/RolesScreen', () => ({
  RolesScreen: () => <div>roles</div>,
}));
vi.mock('./features/organizations/OrganizationsScreen', () => ({
  OrganizationsScreen: () => <div>organizations</div>,
}));
vi.mock('./features/permissions/PermissionsScreen', () => ({
  PermissionsScreen: () => <div>permissions</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
