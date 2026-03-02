import { IUser } from '@ticket-registrator/shared';
import { User } from '../schemas/user.schema';

export const mapUserToIUser = (
  userDoc: User,
): IUser => ({
  id: userDoc.id,
  name: userDoc.name,
  surname: userDoc.surname,
  email: userDoc.email,
  username: userDoc.username,
  role: userDoc.roleId as any, // TODO: replace with role name lookup once roles module is ready
  isVisible: userDoc.isVisible,
  companyId: userDoc.companyId,
  departmentId: userDoc.departmentId,
});
