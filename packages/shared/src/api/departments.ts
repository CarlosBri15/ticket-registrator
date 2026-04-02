import { AxiosInstance } from 'axios';
import { IDepartment } from '../interfaces/department/department.interface';
import { RegisterDepartmentSchema } from '../schemas/department/createDepartment.schema';
import { UpdateDepartmentSchema } from '../schemas/department/updateDepartment.schema';

export const departmentsApi = (client: AxiosInstance) => ({
    getAll: async (companyId: string): Promise<IDepartment[]> => {
        const response = await client.get<IDepartment[]>(`/organizations/${companyId}/departments`);
        return response.data;
    },
    create: async (companyId: string, data: RegisterDepartmentSchema): Promise<IDepartment> => {
        const response = await client.post<IDepartment>(`/organizations/${companyId}/departments`, data);
        return response.data;
    },
    update: async (companyId: string, id: string, data: UpdateDepartmentSchema): Promise<IDepartment> => {
        const response = await client.patch<IDepartment>(`/organizations/${companyId}/departments/${id}`, data);
        return response.data;
    },
    delete: async (companyId: string, id: string): Promise<void> => {
        await client.delete(`/organizations/${companyId}/departments/${id}`);
    },
});
