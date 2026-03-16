import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from '../api/clientContainer';
import { ITicket } from "../interfaces/tickets/ticket.interface";

export const useTicketsQuery = (reportId: string) => {
    return useQuery({
        queryKey: ['tickets', reportId],
        queryFn: () => api.tickets().getByReport(reportId),
        enabled: !!reportId,
    });
};

export const useTicketQuery = (reportId: string, ticketId: string) => {
    return useQuery({
        queryKey: ['tickets', reportId, ticketId],
        queryFn: () => api.tickets().get(reportId, ticketId),
        enabled: !!reportId && !!ticketId,
    });
};

export const useUploadTicketMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, formData }: { reportId: string, formData: FormData }) => 
            api.tickets().upload(reportId, formData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', variables.reportId] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (options?.onSuccess) options.onSuccess(data);
        },
        ...options
    });
};

export const useUpdateTicketMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, ticketId, data }: { reportId: string, ticketId: string, data: Partial<ITicket> }) => 
            api.tickets().update(reportId, ticketId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', variables.reportId] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (options?.onSuccess) options.onSuccess(data);
        },
        ...options
    });
};

export const useDeleteTicketMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, ticketId }: { reportId: string, ticketId: string }) => 
            api.tickets().delete(reportId, ticketId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', variables.reportId] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (options?.onSuccess) options.onSuccess();
        },
        ...options
    });
};

export const useTicketImageQuery = (reportId: string, ticketId: string) => {
    return useQuery({
        queryKey: ['tickets', reportId, ticketId, 'image'],
        queryFn: () => api.tickets().getImageUrl(reportId, ticketId),
        enabled: !!reportId && !!ticketId,
        staleTime: 10 * 60 * 1000, // 10 minutes (signed URLs expire in 15)
    });
};
