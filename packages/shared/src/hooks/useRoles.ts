import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { CreateRoleSchema } from '../schemas/roles/createRole.schema';

export const useSystemRolesQuery = () => {
    return useQuery({
        queryKey: ['roles', 'system'],
        queryFn: () => api.roles().getSystem(),
    });
};

export const useRolesQuery = (companyId?: string) => {
    return useQuery({
        queryKey: ['roles', companyId],
        queryFn: () => api.roles().getByCompany(companyId!),
        enabled: !!companyId,
    });
};

export const useCreateRoleMutation = (companyId: string, options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateRoleSchema) => api.roles().create(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles', companyId] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useDeleteRoleMutation = (companyId: string, options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.roles().delete(companyId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles', companyId] });
            if (options?.onSuccess) options.onSuccess();
        },
    });
};
