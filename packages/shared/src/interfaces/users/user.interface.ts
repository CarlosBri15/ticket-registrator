import type { RoleType } from '../../user-roles/roles';

export interface IUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    username: string;
    roleIds: string[];
    roles: RoleType[];
    companyId: string;
    departmentIds: string[];
}
