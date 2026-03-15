import { IUser, ICurrentUser } from '@ticket-registrator/shared';
import { User } from '../schemas/user.schema';

export type UserWithDepts = User & {
  usersToDepartments?: { departmentId: string }[];
};

export type UserWithRole = User & {
  role?: { name: string; hierarchy: number } | null;
  usersToDepartments?: { departmentId: string }[];
};

const extractDepartmentIds = (user: { usersToDepartments?: { departmentId: string }[] | null }): string[] =>
  user.usersToDepartments ? user.usersToDepartments.map((ud) => ud.departmentId) : [];

export const mapUserToIUser = (user: UserWithDepts): IUser => ({
  id: user.id,
  name: user.name ?? '',
  surname: user.surname ?? '',
  email: user.email ?? '',
  username: user.username ?? '',
  roleId: user.roleId ?? '',
  companyId: user.companyId ?? null,
  departmentIds: extractDepartmentIds(user),
});

export const mapUserToICurrentUser = (user: UserWithRole, permissions: string[]): ICurrentUser => ({
  id: user.id,
  name: user.name ?? '',
  surname: user.surname ?? '',
  email: user.email ?? '',
  username: user.username ?? '',
  roleId: user.roleId ?? '',
  companyId: user.companyId ?? null,
  departmentIds: extractDepartmentIds(user),
  roleName: user.role?.name ?? '',
  hierarchy: user.role?.hierarchy ?? 0,
  permissions,
});
