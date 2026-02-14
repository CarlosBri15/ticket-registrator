import { IUser } from '@ticket-registrator/shared';
import { UserDocument } from '../schemas/user.schema';

export const mapUserToIUser = (
  userDoc: UserDocument,
): IUser => ({
  id: userDoc._id.toString(),
  name: userDoc.name,
  surname: userDoc.surname,
  email: userDoc.email,
  username: userDoc.username,
  isVisible: userDoc.isVisible,
});
