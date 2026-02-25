export const Roles = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin',
} as const;


export type RoleType = typeof Roles[keyof typeof Roles];

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  Employee: 1,
  Manager: 2,
  Admin: 3,
  SuperAdmin: 4,
};