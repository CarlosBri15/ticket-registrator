import { IUser } from '@ticket-registrator/shared';

export const mapUserToIUser = (
  user: any,
): IUser => {

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
    roleId: user.roleId ?? '',
    companyId: user.companyId ?? '',
    departmentIds,
  };
};
