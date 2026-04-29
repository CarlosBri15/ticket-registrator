import { useScope, useScopeContext, usePermissions, useUserQuery, ROLE_HIERARCHY } from "@ticket-registrator/shared";
import { SuperAdminGlobalDashboard } from "./SuperAdminDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { ControllerDashboard } from "./ControllerDashboard";
import { RegularDashboard } from "./RegularDashboard";

export const DashboardPage = () => {
  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { can } = usePermissions();
  const { data: user } = useUserQuery();

  if (isGlobal && !activeCompanyId) return <SuperAdminGlobalDashboard />;
  if (can("approve_reports") && (user?.hierarchy ?? 0) >= ROLE_HIERARCHY.ADMIN) return <AdminDashboard />;
  if (can("approve_reports") && (user?.hierarchy ?? 0) < ROLE_HIERARCHY.ADMIN) return <ControllerDashboard />;
  return <RegularDashboard />;
};
