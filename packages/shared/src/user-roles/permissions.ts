export const permissions = {
  // General user
  VIEW_OWN_REPORTS: 'view_own_reports',
  EDIT_OWN_REPORTS: 'edit_own_reports',
  VIEW_OWN_TICKETS: 'view_own_tickets',
  EDIT_OWN_TICKETS: 'edit_own_tickets',
  SUBMIT_REPORTS: 'submit_reports',
  VIEW_OWN_USER_INFO: 'view_own_user_info',
  EDIT_OWN_USER_INFO: 'edit_own_user_info',
  DELETE_USER: 'delete_user',

  // Team
  VIEW_TEAM_REPORTS: 'view_team_reports',
  VIEW_TEAM_TICKETS: 'view_team_tickets',
  VIEW_TEAM_USERS: 'view_team_users',


  // ADMIN
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_ALL_REPORTS: 'view_all_reports',
  VIEW_ALL_TICKETS: 'view_all_tickets',
  APPROVE_REPORTS: 'approve_reports',
  APPROVE_TICKETS: 'approve_tickets',

  // User management
  CREATE_USERS: 'create_users',            // Can create new users within hierarchy
  EDIT_USERS: 'edit_users',                // Can edit users below their hierarchy
  ASSIGN_ROLES: 'assign_roles',            // Can assign roles < their hierarchy

  // Super Admin
  MANAGE_PERMISSIONS: 'manage_permissions', // Full permission management
} as const;

export type PermissionType = typeof permissions[keyof typeof permissions];
