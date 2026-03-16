import type { IUser } from '../users/user.interface';

export interface ICurrentUser extends IUser {
    roleName: string;
    hierarchy: number;
    permissions: string[];
}
