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
  // TODO(future-dashboards-rethink): the next two branches use a hierarchy
  // check on top of the `approve_reports` permission. This violates the
  // permission-driven contract and won't scale once orgs define their own
  // roles. The whole dashboard layer is scheduled to be redesigned as a
  // composition of permission-gated widgets — see
  // `~/.claude/projects/.../memory/future_dashboards_rethink.md`.
  if (can("approve_reports") && (user?.hierarchy ?? 0) >= ROLE_HIERARCHY.ADMIN) return <AdminDashboard />;
  if (can("approve_reports") && (user?.hierarchy ?? 0) < ROLE_HIERARCHY.ADMIN) return <ControllerDashboard />;
  return <RegularDashboard />;
};
