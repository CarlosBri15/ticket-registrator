import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from '../api/clientContainer';

export const useTicketsQuery = (reportId: string) => {
    return useQuery({
        queryKey: ['tickets', reportId],
        queryFn: () => api.tickets().getByReport(reportId),
        enabled: !!reportId,
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
