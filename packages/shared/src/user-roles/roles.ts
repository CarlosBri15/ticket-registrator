export const Roles = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  CONTROLLER: 'Controller',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin',
} as const;


export type RoleType = typeof Roles[keyof typeof Roles];

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  Employee: 1,
  Manager: 2,
  Controller: 3,
  Admin: 4,
  SuperAdmin: 5,
};

export const DEFAULT_DEPARTMENTS = [
  'People & Culture',
  'Marketing & Communications',
  'Finance & Controlling',
  'Legal & Compliance'
] as const;