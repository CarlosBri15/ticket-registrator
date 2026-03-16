import { AxiosInstance } from 'axios';
import { IPermission } from '../interfaces/permissions/permission.interface';
import { IRolePermission } from '../interfaces/permissions/rolePermission.interface';
import { AssignPermission } from '../schemas/permissions/assignPermission.schema';

export const permissionsApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<IPermission[]> => {
        const response = await client.get<IPermission[]>('/permissions');
        return response.data;
    },
    assignToRole: async (data: AssignPermission): Promise<IRolePermission> => {
        const response = await client.post<IRolePermission>('/permissions/assign-role', data);
        return response.data;
    },
    unassignFromRole: async (roleId: string, permissionId: string): Promise<void> => {
        await client.delete(`/permissions/unassign-role/role/${roleId}/permission/${permissionId}`);
    },
});
