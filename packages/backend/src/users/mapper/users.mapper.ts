import { IUser } from '@ticket-registrator/shared';
import { User } from '../schemas/user.schema';

export type UserWithDepts = User & {
  usersToDepartments?: { departmentId: string }[];
};

export const mapUserToIUser = (user: UserWithDepts): IUser => {
  // Map departmentIds from junction table (usersToDepartments -> department)
  const departmentIds = user.usersToDepartments
    ? user.usersToDepartments.map((ud) => ud.departmentId)
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
