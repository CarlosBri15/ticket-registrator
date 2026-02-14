import { AxiosInstance } from 'axios';
import { ITicket } from '../interfaces/tickets/ticket.interface';

export const ticketsApi = (client: AxiosInstance) => ({
    getByReport: async (reportId: string): Promise<ITicket[]> => {
        const response = await client.get<ITicket[]>(`/reports/${reportId}/tickets`);
        return response.data;
    },
    get: async (reportId: string, ticketId: string): Promise<ITicket> => {
        const response = await client.get<ITicket>(`/reports/${reportId}/tickets/${ticketId}`);
        return response.data;
    },
    upload: async (reportId: string, formData: FormData): Promise<ITicket> => {
        const response = await client.post<ITicket>(`/reports/${reportId}/tickets`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },
    update: async (reportId: string, ticketId: string, data: Partial<ITicket>): Promise<ITicket> => {
        const response = await client.patch<ITicket>(`/reports/${reportId}/tickets/${ticketId}`, data);
        return response.data;
    },
    delete: async (reportId: string, ticketId: string): Promise<void> => {
        await client.delete(`/reports/${reportId}/tickets/${ticketId}`);
    },
    getImageUrl: async (reportId: string, ticketId: string): Promise<{ url: string }> => {
        const response = await client.get<{ url: string }>(`/reports/${reportId}/tickets/${ticketId}/image`);
        return response.data;
    }
});
