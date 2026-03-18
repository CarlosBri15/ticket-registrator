import { AxiosInstance } from 'axios';
import { IOrganization } from '../interfaces/organization/organization.interface';
import { IOnboardResponse } from '../interfaces/organization/onboardResponse.interface';
import { OnboardOrganizationSchema } from '../schemas/organization/onboardOrganization.schema';
import { UpdateOrganizationSchema } from '../schemas/organization/updateOrganization.schema';

export const organizationsApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<IOrganization[]> => {
        const response = await client.get<IOrganization[]>('/organizations');
        return response.data;
    },
    onboard: async (data: OnboardOrganizationSchema): Promise<IOnboardResponse> => {
        const response = await client.post<IOnboardResponse>('/organizations/onboard', data);
        return response.data;
    },
    update: async (id: string, data: UpdateOrganizationSchema): Promise<IOrganization> => {
        const response = await client.patch<IOrganization>(`/organizations/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await client.delete(`/organizations/${id}`);
    },
});
