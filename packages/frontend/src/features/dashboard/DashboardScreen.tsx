import { useScope, useScopeContext, usePermissions, useUserQuery } from "@ticket-registrator/shared";
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
  if (can("approve_reports") && (user?.hierarchy ?? 0) >= 99) return <AdminDashboard />;
  if (can("approve_reports") && (user?.hierarchy ?? 0) < 99) return <ControllerDashboard />;
  return <RegularDashboard />;
};
