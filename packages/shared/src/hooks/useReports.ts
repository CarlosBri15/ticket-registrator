import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateReportSchema } from '../index';
import { api } from '../api/clientContainer';

export const useReportsQuery = () => {
    return useQuery({
        queryKey: ['reports'],
        queryFn: () => api.reports().getAll(),
    });
};

export const useReportQuery = (id?: string) => {
    return useQuery({
        queryKey: ['reports', id],
        queryFn: () => api.reports().getOne(id!),
        enabled: !!id,
    });
};

export const useCreateReportMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReportSchema) => api.reports().create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
             if (options?.onError) options.onError(error);
        }
    });
};
