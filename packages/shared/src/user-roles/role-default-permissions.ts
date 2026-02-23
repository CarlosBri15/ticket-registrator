import type { RoleType } from './roles';
import { Roles } from './roles';
import { permissions } from './permissions';
import type { PermissionType } from './permissions';

const all_permissions = Object.values(permissions) as PermissionType[];

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  [Roles.EMPLOYEE]: [
    permissions.VIEW_OWN_REPORTS,
    permissions.EDIT_OWN_REPORTS,
    permissions.VIEW_OWN_TICKETS,
    permissions.EDIT_OWN_TICKETS,
    permissions.SUBMIT_REPORTS,
    permissions.VIEW_OWN_USER_INFO,
    permissions.EDIT_OWN_USER_INFO,
    permissions.DELETE_USER
  ],

  [Roles.MANAGER]: [
    ...[
      permissions.VIEW_OWN_REPORTS,
      permissions.EDIT_OWN_REPORTS,
      permissions.VIEW_OWN_TICKETS,
      permissions.EDIT_OWN_TICKETS,
      permissions.SUBMIT_REPORTS,
      permissions.VIEW_OWN_USER_INFO,
      permissions.EDIT_OWN_USER_INFO,
    ],
    permissions.VIEW_TEAM_REPORTS,
    permissions.VIEW_TEAM_TICKETS,
    permissions.VIEW_TEAM_USERS,
    permissions.CREATE_USERS,    //Create Employee users (within department but need to discuss)
    permissions.DELETE_USER,      //Edit Employee users (within department)
  ],

  [Roles.ADMIN]: [
    ...[
      permissions.VIEW_OWN_REPORTS,
      permissions.EDIT_OWN_REPORTS,
      permissions.VIEW_OWN_TICKETS,
      permissions.EDIT_OWN_TICKETS,
      permissions.SUBMIT_REPORTS,
      permissions.VIEW_OWN_USER_INFO,
      permissions.EDIT_OWN_USER_INFO,
    ],
    permissions.VIEW_ALL_USERS,
    permissions.VIEW_ALL_REPORTS,
    permissions.VIEW_ALL_TICKETS,
    permissions.APPROVE_REPORTS,
    permissions.APPROVE_TICKETS,
    permissions.CREATE_USERS,    // Can create Employee or Manager users below hierarchy
    permissions.EDIT_USERS,
    permissions.DELETE_USER,      // Can edit Employee or Manager users below hierarchy
    permissions.ASSIGN_ROLES,    // Only roles below their hierarchy
  ],

  [Roles.SUPERADMIN]: all_permissions, // Full access within an organization
};
