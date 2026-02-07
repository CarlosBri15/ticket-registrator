import { AxiosInstance } from 'axios';
import { IReport, CreateReportSchema } from '../index';

export const reportsApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<IReport[]> => {
        const response = await client.get<IReport[]>('/reports');
        return response.data;
    },
    getOne: async (id: string): Promise<IReport> => {
        const response = await client.get<IReport>(`/reports/${id}`);
        return response.data;
    },
    create: async (data: CreateReportSchema): Promise<IReport> => {
        const response = await client.post<IReport>('/reports', data);
        return response.data;
    }
});
