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
    /**
     * Supervisor review action: updates a single item's status (Approved /
     * Rejected / Pending / Partially_approved) without touching siblings nor
     * the rest of the ticket. Backed by `PATCH /tickets/:id/items/:itemId/status`.
     */
    updateItemStatus: async (
        reportId: string,
        ticketId: string,
        itemId: string,
        status: string,
    ): Promise<ITicket> => {
        const response = await client.patch<ITicket>(
            `/reports/${reportId}/tickets/${ticketId}/items/${itemId}/status`,
            { status },
        );
        return response.data;
    },
    /**
     * Bulk supervisor review action: marks every item of the ticket with the
     * same status in a single transaction. Backs the "Approve all" / "Reject
     * all" shortcut buttons.
     */
    updateAllItemsStatus: async (
        reportId: string,
        ticketId: string,
        status: string,
    ): Promise<ITicket> => {
        const response = await client.patch<ITicket>(
            `/reports/${reportId}/tickets/${ticketId}/items/status`,
            { status },
        );
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
