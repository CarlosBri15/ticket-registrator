import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { OnboardOrganizationSchema } from '../schemas/organization/onboardOrganization.schema';
import { UpdateOrganizationSchema } from '../schemas/organization/updateOrganization.schema';
import { usePermissions } from './usePermissions';
import { permissions } from '../defaults/permissions';

export const useOrganizationsQuery = (options?: { enabled?: boolean }) => {
    const { can } = usePermissions();
    const hasPermission = can(permissions.VIEW_COMPANY);

    return useQuery({
        queryKey: ['organizations'],
        queryFn: () => api.organizations().getAll(),
        enabled: hasPermission && (options?.enabled !== false),
        ...options,
    });
};

export const useOnboardOrganizationMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: OnboardOrganizationSchema) => api.organizations().onboard(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useUpdateOrganizationMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationSchema }) =>
            api.organizations().update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useDeleteOrganizationMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.organizations().delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            if (options?.onSuccess) options.onSuccess();
        },
    });
};

export const useOrganizationQuery = (id?: string, options?: { enabled?: boolean }) => {
    const { can } = usePermissions();
    const hasPermission = can(permissions.VIEW_COMPANY);

    return useQuery({
        queryKey: ['organizations', id],
        queryFn: async () => {
            if (!id) return null;
            const orgs = await api.organizations().getAll();
            return orgs.find((o) => o.id === id) || null;
        },
        enabled: !!id && hasPermission && (options?.enabled !== false),
        ...options,
    });
};
