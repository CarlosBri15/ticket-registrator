import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScopeProvider, fonts, CACHE_CONFIG } from "@ticket-registrator/shared";
import { PrivateRoute } from "./router/PrivateRoute";
import { AppLayout } from "./components/layouts/AppLayout";

// ─── Lazy-loaded screens ──────────────────────────────────────────────────────
// Each screen is a separate bundle chunk — only downloaded when first visited.

const LoginForm             = lazy(() => import("./features/auth/screens/LoginScreen").then(m => ({ default: m.LoginForm })));
const RegisterForm          = lazy(() => import("./features/auth/screens/RegisterScreen").then(m => ({ default: m.RegisterForm })));
const DashboardPage         = lazy(() => import("./features/dashboard/DashboardScreen").then(m => ({ default: m.DashboardPage })));
const ReportsScreen         = lazy(() => import("./features/reports/screens/ReportsScreen").then(m => ({ default: m.ReportsScreen })));
const ReportDetailScreen    = lazy(() => import("./features/reports/screens/ReportDetailScreen").then(m => ({ default: m.ReportDetailScreen })));
const AllTicketsScreen      = lazy(() => import("./features/tickets/screens/TicketsScreen").then(m => ({ default: m.AllTicketsScreen })));
const SettingsScreen        = lazy(() => import("./features/settings/screens/SettingsScreen").then(m => ({ default: m.SettingsScreen })));
const UsersScreen           = lazy(() => import("./features/users/screens/UsersScreen").then(m => ({ default: m.UsersScreen })));
const UserDetailScreen      = lazy(() => import("./features/users/screens/UserDetailScreen").then(m => ({ default: m.UserDetailScreen })));
const DepartmentsScreen     = lazy(() => import("./features/departments/screens/DepartmentsScreen").then(m => ({ default: m.DepartmentsScreen })));
const DepartmentDetailScreen = lazy(() => import("./features/departments/screens/DepartmentDetailScreen").then(m => ({ default: m.DepartmentDetailScreen })));
const RolesScreen           = lazy(() => import("./features/roles/screens/RolesScreen").then(m => ({ default: m.RolesScreen })));
const OrganizationsScreen   = lazy(() => import("./features/organizations/screens/OrganizationsScreen").then(m => ({ default: m.OrganizationsScreen })));
const OrganizationDetailScreen = lazy(() => import("./features/organizations/screens/OrganizationDetailScreen").then(m => ({ default: m.OrganizationDetailScreen })));
const PermissionsScreen     = lazy(() => import("./features/permissions/screens/PermissionsScreen").then(m => ({ default: m.PermissionsScreen })));

// ─── QueryClient singleton ────────────────────────────────────────────────────
// Defined at module scope — never recreated on re-renders.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.STALE_TIME,
      gcTime:    CACHE_CONFIG.GC_TIME,
      retry: 1,                    // one retry on failure (not 3)
      refetchOnWindowFocus: false, // no surprise refetch when user alt-tabs back
    },
  },
});

// ─── Page-transition loader ───────────────────────────────────────────────────

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-surface">
    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <>
      <style>{`
        :root { --font-main: '${fonts.family}'; }
      `}</style>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScopeProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login"    element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Protected routes — auth required */}
                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home"    element={<DashboardPage />} />

                  {/* Tickets & Reports */}
                  <Route path="/reports"     element={<ReportsScreen />} />
                  <Route path="/reports/:id" element={<ReportDetailScreen />} />
                  <Route
                    path="/tickets"
                    element={
                      <PrivateRoute permission="view_tickets">
                        <AllTicketsScreen />
                      </PrivateRoute>
                    }
                  />

                  {/* Management */}
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

                  {/* Settings */}
                  <Route path="/settings" element={<SettingsScreen />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </ScopeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
