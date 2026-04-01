import { useUserQuery } from './useAuth';
import type { PermissionType } from '../defaults/permissions';

/**
 * Centralised permission checker.
 *
 * Uses the effective permissions returned by /users/me (role defaults + overrides),
 * so custom roles with specific permission sets work automatically.
 *
 * Usage:
 *   const { can, canAny, canAll } = usePermissions()
 *   can('create_users')              // single check
 *   canAny(['approve_reports', 'approve_tickets'])
 *   canAll(['view_users', 'edit_users'])
 */
export const usePermissions = () => {
    const { data: user } = useUserQuery();

    const can = (permission: PermissionType): boolean => {
        if (!user?.permissions) return false;
        return user.permissions.includes(permission);
    };

    const canAny = (perms: PermissionType[]): boolean => perms.some((p) => can(p));

    const canAll = (perms: PermissionType[]): boolean => perms.every((p) => can(p));

    return { can, canAny, canAll };
};
