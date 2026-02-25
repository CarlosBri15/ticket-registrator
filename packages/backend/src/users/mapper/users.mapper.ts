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
  role: userDoc.role,
  isVisible: userDoc.isVisible,
  companyId: userDoc.companyId,
  departmentId: userDoc.departmentId,
});
