import { AxiosInstance } from 'axios';
import { IReport, CreateReportSchema, PaginatedList, ReportPaginationParams } from '../index';

export const reportsApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<IReport[]> => {
        const response = await client.get<IReport[]>('/reports');
        return response.data;
    },
    getPaginated: async (params: ReportPaginationParams): Promise<PaginatedList<IReport>> => {
        const response = await client.get<PaginatedList<IReport>>('/reports/paginated', { params });
        return response.data;
    },
    getOne: async (id: string): Promise<IReport> => {

        const response = await client.get<IReport>(`/reports/${id}`);
        return response.data;
    },
    create: async (data: CreateReportSchema): Promise<IReport> => {
        const response = await client.post<IReport>('/reports', data);
        return response.data;
    },
    submit: async (id: string): Promise<IReport> => {
        const response = await client.patch<IReport>(`/reports/${id}/submit`);
        return response.data;
    },
    updateStatus: async (id: string, status: string): Promise<IReport> => {
        const response = await client.patch<IReport>(`/reports/${id}/status`, { status });
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await client.delete(`/reports/${id}`);
    },
});
