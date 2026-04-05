export const Roles = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  CONTROLLER: 'Controller',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin',
} as const;

export type RoleType = typeof Roles[keyof typeof Roles];

export const AUTHORITY_LEVELS = {
  GLOBAL: 100,
  COMPANY: 99,
  DEPARTMENT: 40,
  SELF: 0,
} as const;

export const ROLE_NAME_TO_HIERARCHY: Record<RoleType, number> = {
  Employee: 0,
  Manager: 50,
  Controller: 40,
  Admin: 99,
  SuperAdmin: 100,
};

export const DEFAULT_DEPARTMENTS = [
  'People & Culture',
  'Marketing & Communications',
  'Finance & Controlling',
  'Legal & Compliance'
] as const;
