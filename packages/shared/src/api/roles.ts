import { AxiosInstance } from 'axios';
import { IRole } from '../interfaces/roles/role.interface';
import { IPermission } from '../interfaces/permissions/permission.interface';
import { CreateRoleSchema } from '../schemas/roles/createRole.schema';

export const rolesApi = (client: AxiosInstance) => ({
    getSystem: async (): Promise<IRole[]> => {
        const response = await client.get<IRole[]>('/roles');
        return response.data;
    },
    getByCompany: async (companyId: string): Promise<IRole[]> => {
        const response = await client.get<IRole[]>(`/organizations/${companyId}/roles`);
        return response.data;
    },
    create: async (companyId: string, data: CreateRoleSchema): Promise<IRole> => {
        const response = await client.post<IRole>(`/organizations/${companyId}/roles`, data);
        return response.data;
    },
    delete: async (companyId: string, id: string): Promise<void> => {
        await client.delete(`/organizations/${companyId}/roles/${id}`);
    },
    getRolePermissions: async (companyId: string, roleId: string): Promise<IPermission[]> => {
        const response = await client.get<IPermission[]>(
            `/organizations/${companyId}/roles/${roleId}/permissions`,
        );
        return response.data;
    },
});
