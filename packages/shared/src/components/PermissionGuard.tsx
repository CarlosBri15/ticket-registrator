import { usePermissions } from '../hooks/usePermissions';
import type { IPermissionGuardProps } from '../interfaces/permissions/permissionGuard.interface';

/**
 * Conditionally renders children based on the user's effective permissions.
 * Works identically on web (React) and mobile (React Native) since it only
 * uses React.Fragment — no DOM or Native APIs.
 *
 * Usage:
 *   <PermissionGuard permission="create_users">
 *     <CreateUserButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard anyOf={['approve_reports', 'approve_tickets']}>
 *     <ApprovePanel />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="view_roles" fallback={<AccessDenied />}>
 *     <RolesScreen />
 *   </PermissionGuard>
 */
export const PermissionGuard = ({
    permission,
    anyOf,
    allOf,
    children,
    fallback = null,
}: IPermissionGuardProps) => {
    const { can, canAny, canAll } = usePermissions();

    const hasAccess =
        (permission ? can(permission) : true) &&
        (anyOf ? canAny(anyOf) : true) &&
        (allOf ? canAll(allOf) : true);

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};
