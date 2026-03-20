import { useScope, useScopeContext, usePermissions } from "@ticket-registrator/shared";
import { SuperAdminGlobalDashboard } from "./SuperAdminDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { ControllerDashboard } from "./ControllerDashboard";
import { RegularDashboard } from "./RegularDashboard";

export const DashboardPage = () => {
  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { can } = usePermissions();

  if (isGlobal && !activeCompanyId) return <SuperAdminGlobalDashboard />;
  if (can("view_users") && can("approve_reports")) return <AdminDashboard />;
  if (can("approve_reports") && !can("view_users")) return <ControllerDashboard />;
  return <RegularDashboard />;
};
