import type { PermissionType} from '../../user-roles/permissions';
import type { RoleType } from '../../user-roles/roles';

export interface IUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    username: string;
    isVisible: boolean;
    role: RoleType;
    companyId: string;
    departmentId: string;
}
