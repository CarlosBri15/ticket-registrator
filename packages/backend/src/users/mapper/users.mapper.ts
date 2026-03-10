import { IUser } from '@ticket-registrator/shared';

export const mapUserToIUser = (
  user: any,
): IUser => {
  // Map roles from junction table (usersToRoles -> role)
  const roles = user.usersToRoles
    ? user.usersToRoles.map((ur: any) => ur.role.name)
    : [];

  // Map roleIds
  const roleIds = user.usersToRoles
    ? user.usersToRoles.map((ur: any) => ur.roleId)
    : [];

  // Map departmentIds from junction table (usersToDepartments -> department)
  const departmentIds = user.usersToDepartments
    ? user.usersToDepartments.map((ud: any) => ud.departmentId)
    : [];

  return {
    id: user.id,
    name: user.name ?? '',
    surname: user.surname ?? '',
    email: user.email ?? '',
    username: user.username ?? '',
    roleIds,
    roles,
    companyId: user.companyId ?? '',
    departmentIds,
  };
};
