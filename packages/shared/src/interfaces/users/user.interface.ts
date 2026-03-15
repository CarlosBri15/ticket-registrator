export interface IUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    username: string;
    roleId: string;
    companyId: string | null;
    departmentIds: string[];
}
