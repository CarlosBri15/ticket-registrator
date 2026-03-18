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
        queryFn: () => api.reports().getOne(id),
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

export const useSubmitReportMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.reports().submit(id),
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['reports', id] });
            if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        }
    });
};

export const useUpdateReportStatusMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.reports().updateStatus(id, status),
        onSuccess: (data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['reports', id] });
            if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useDeleteReportMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.reports().delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (options?.onSuccess) options.onSuccess();
        },
    });
};
