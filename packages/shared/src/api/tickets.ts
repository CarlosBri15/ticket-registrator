import { AxiosInstance } from 'axios';
import { ITicket } from '../interfaces/tickets/ticket.interface';

export const ticketsApi = (client: AxiosInstance) => ({
    getByReport: async (reportId: string): Promise<ITicket[]> => {
        const response = await client.get<ITicket[]>(`/tickets/report/${reportId}`);
        return response.data;
    },
    get: async (reportId: string, ticketId: string): Promise<ITicket> => {
        const response = await client.get<ITicket>(`/tickets/${ticketId}/report/${reportId}`);
        return response.data;
    },
    upload: async (reportId: string, formData: FormData): Promise<ITicket> => {
        const response = await client.post<ITicket>(`/tickets/${reportId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },
    update: async (reportId: string, ticketId: string, data: Partial<ITicket>): Promise<ITicket> => {
        const response = await client.patch<ITicket>(`/tickets/${ticketId}/report/${reportId}`, data);
        return response.data;
    },
    delete: async (reportId: string, ticketId: string): Promise<void> => {
        await client.delete(`/tickets/${ticketId}/report/${reportId}`);
    },
    getImageUrl: async (reportId: string, ticketId: string): Promise<{ url: string }> => {
        const response = await client.get<{ url: string }>(`/tickets/${ticketId}/report/${reportId}/image`);
        return response.data;
    }
});
