import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScopeProvider } from "@ticket-registrator/shared";
import { PrivateRoute } from "./router/PrivateRoute";
import { AppLayout } from "./components/layouts/AppLayout";
import { LoginForm } from "./features/auth/screens/LoginScreen";
import { RegisterForm } from "./features/auth/screens/RegisterScreen";
import { DashboardPage } from "./features/dashboard/DashboardScreen";
import { ReportsScreen } from "./features/reports/screens/ReportsScreen";
import { ReportDetailScreen } from "./features/reports/screens/ReportDetailScreen";
import { AllTicketsScreen } from "./features/tickets/screens/TicketsScreen";
import { SettingsScreen } from "./features/settings/screens/SettingsScreen";
import { UsersScreen } from "./features/users/screens/UsersScreen";
import { UserDetailScreen } from "./features/users/screens/UserDetailScreen";
import { DepartmentsScreen } from "./features/departments/screens/DepartmentsScreen";
import { DepartmentDetailScreen } from "./features/departments/screens/DepartmentDetailScreen";
import { RolesScreen } from "./features/roles/screens/RolesScreen";
import { OrganizationsScreen } from "./features/organizations/screens/OrganizationsScreen";
import { OrganizationDetailScreen } from "./features/organizations/screens/OrganizationDetailScreen";
import { PermissionsScreen } from "./features/permissions/screens/PermissionsScreen";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScopeProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Protected routes — auth required */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<DashboardPage />} />

              {/* Tickets & Reports — all authenticated users */}
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/reports/:id" element={<ReportDetailScreen />} />
              <Route
                path="/tickets"
                element={
                  <PrivateRoute permission="view_tickets">
                    <AllTicketsScreen />
                  </PrivateRoute>
                }
              />

              {/* Management — permission-gated */}
              <Route
                path="/users"
                element={
                  <PrivateRoute permission="view_users">
                    <UsersScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <PrivateRoute permission="view_users">
                    <UserDetailScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <PrivateRoute permission="view_departments">
                    <DepartmentsScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/departments/:id"
                element={
                  <PrivateRoute permission="view_departments">
                    <DepartmentDetailScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <PrivateRoute permission="view_roles">
                    <RolesScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizations"
                element={
                  <PrivateRoute permission="view_company">
                    <OrganizationsScreen />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizations/:id"
                element={
                  <PrivateRoute permission="view_company">
                    <OrganizationDetailScreen />
                  </PrivateRoute>
                }
              />

              <Route
                path="/permissions"
                element={
                  <PrivateRoute permission="view_permissions">
                    <PermissionsScreen />
                  </PrivateRoute>
                }
              />

              {/* Settings — all authenticated users */}
              <Route path="/settings" element={<SettingsScreen />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </ScopeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
