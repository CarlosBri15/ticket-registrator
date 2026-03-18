import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { OnboardOrganizationSchema } from '../schemas/organization/onboardOrganization.schema';
import { UpdateOrganizationSchema } from '../schemas/organization/updateOrganization.schema';

export const useOrganizationsQuery = () => {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: () => api.organizations().getAll(),
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

export const useOrganizationQuery = (id?: string) => {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: () => api.organizations().getAll(),
        select: (orgs) => orgs.find((o) => o.id === id),
        enabled: !!id,
    });
};
