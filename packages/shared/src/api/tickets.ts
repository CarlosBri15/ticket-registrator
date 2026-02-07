import { AxiosInstance } from 'axios';
import { ITicket } from '../interfaces/tickets/ticket.interface';

export const ticketsApi = (client: AxiosInstance) => ({
    getByReport: async (reportId: string): Promise<ITicket[]> => {
        const response = await client.get<ITicket[]>(`/tickets/report/${reportId}`);
        return response.data;
    },
    upload: async (reportId: string, formData: FormData): Promise<ITicket> => {
        const response = await client.post<ITicket>(`/gemini/extract-receipt`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { reportId } // Assuming backend needs reportId
        });
        return response.data;
    }
});
