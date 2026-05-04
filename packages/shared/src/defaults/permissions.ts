export const permissions = {
  // Users
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  // Reports
  VIEW_REPORTS: 'view_reports',
  CREATE_REPORTS: 'create_reports',
  EDIT_REPORTS: 'edit_reports',
  DELETE_REPORTS: 'delete_reports',
  SUBMIT_REPORTS: 'submit_reports',
  APPROVE_REPORTS: 'approve_reports',

  // Tickets
  VIEW_TICKETS: 'view_tickets',
  CREATE_TICKETS: 'create_tickets',
  EDIT_TICKETS: 'edit_tickets',
  DELETE_TICKETS: 'delete_tickets',
  APPROVE_TICKETS: 'approve_tickets',

  // Items
  APPROVE_ITEMS: 'approve_items',

  // Roles & Permissions
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',

  VIEW_PERMISSIONS: 'view_permissions',
  CREATE_PERMISSIONS: 'create_permissions',
  EDIT_PERMISSIONS: 'edit_permissions',
  DELETE_PERMISSIONS: 'delete_permissions',
  MANAGE_PERMISSIONS: 'manage_permissions',

  // Departments
  VIEW_DEPARTMENTS: 'view_departments',
  CREATE_DEPARTMENTS: 'create_departments',
  EDIT_DEPARTMENTS: 'edit_departments',
  DELETE_DEPARTMENTS: 'delete_departments',

  // Company/Organization
  VIEW_COMPANY: 'view_company',
  CREATE_COMPANY: 'create_company',
  EDIT_COMPANY: 'edit_company',
  DELETE_COMPANY: 'delete_company',

  // Categories
  VIEW_CATEGORIES: 'view_categories',
  CREATE_CATEGORIES: 'create_categories',
  EDIT_CATEGORIES: 'edit_categories',
  DELETE_CATEGORIES: 'delete_categories',

  // Policies
  VIEW_POLICIES: 'view_policies',
  CREATE_POLICIES: 'create_policies',
  EDIT_POLICIES: 'edit_policies',
  DELETE_POLICIES: 'delete_policies',

  // Special
  CREATE_ADMINS: 'create_admins', // Might keep this for specific security check
} as const;

export type PermissionType = typeof permissions[keyof typeof permissions];
