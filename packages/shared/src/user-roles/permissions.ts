export const permissions = {
  // General user
  VIEW_OWN_REPORTS: 'view_own_reports',
  EDIT_OWN_REPORTS: 'edit_own_reports',
  CREATE_OWN_REPORTS: 'create_own_reports',
  DELETE_OWN_REPORTS: 'delete_own_reports',
  VIEW_OWN_TICKETS: 'view_own_tickets',
  EDIT_OWN_TICKETS: 'edit_own_tickets',
  CREATE_OWN_TICKETS: 'create_own_tickets',
  DELETE_OWN_TICKETS: 'delete_own_tickets',
  SUBMIT_OWN_REPORTS: 'submit_own_reports',
  VIEW_OWN_USER_INFO: 'view_own_user_info',
  EDIT_OWN_USER_INFO: 'edit_own_user_info',
  DELETE_USER: 'delete_user',

  // Team
  VIEW_TEAM_REPORTS: 'view_team_reports',
  VIEW_TEAM_TICKETS: 'view_team_tickets',
  VIEW_TEAM_USERS: 'view_team_users',


  // CONTROLLER
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_ALL_REPORTS: 'view_all_reports',
  VIEW_ALL_TICKETS: 'view_all_tickets',
  APPROVE_REPORTS: 'approve_reports',
  APPROVE_TICKETS: 'approve_tickets',
  APPROVE_ITEMS: 'approve_items',

  // ADMIN
  CREATE_USERS: 'create_users',            // Can create new users within hierarchy
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',   // Can edit users below their hierarchy
  CREATE_ROLES: 'create_roles',            // Can assign roles < their hierarchy
  EDIT_ROLES: 'edit_roles',                // Can assign roles < their hierarchy
  DELETE_ROLES: 'delete_roles',            // Can assign roles < their hierarchy
  VIEW_ROLES: 'view_roles',                // Can assign roles < their hierarchy
  CREATE_PERMISSIONS: 'create_permissions', // Can assign permissions < their hierarchy
  EDIT_PERMISSIONS: 'edit_permissions',    // Can assign permissions < their hierarchy
  DELETE_PERMISSIONS: 'delete_permissions', // Can assign permissions < their hierarchy
  VIEW_PERMISSIONS: 'view_permissions',    // Can assign permissions < their hierarchy
  CREATE_DEPARTMENTS: 'create_departments',
  EDIT_DEPARTMENTS: 'edit_departments',
  DELETE_DEPARTMENTS: 'delete_departments',
  VIEW_DEPARTMENTS: 'view_departments',


  // Super Admin
  MANAGE_PERMISSIONS: 'manage_permissions', // Full permission management
  CREATE_COMPANY: 'create_company',
  EDIT_COMPANY: 'edit_company',
  DELETE_COMPANY: 'delete_company',
  VIEW_COMPANY: 'view_company',
  CREATE_ADMINS: 'create_admins',
  EDIT_ADMINS: 'edit_admins',
  DELETE_ADMINS: 'delete_admins',
  VIEW_ADMINS: 'view_admins',
} as const;

export type PermissionType = typeof permissions[keyof typeof permissions];
