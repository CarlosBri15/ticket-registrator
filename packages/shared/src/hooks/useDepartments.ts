import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { RegisterDepartmentSchema } from '../schemas/department/createDepartment.schema';
import { UpdateDepartmentSchema } from '../schemas/department/updateDepartment.schema';

export const useDepartmentsQuery = (companyId?: string) => {
    return useQuery({
        queryKey: ['departments', companyId],
        queryFn: () => api.departments().getAll(companyId!),
        enabled: !!companyId,
    });
};

export const useCreateDepartmentMutation = (companyId: string, options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RegisterDepartmentSchema) =>
            api.departments().create(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useUpdateDepartmentMutation = (companyId: string, options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentSchema }) =>
            api.departments().update(companyId, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useDeleteDepartmentMutation = (companyId: string, options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.departments().delete(companyId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
            if (options?.onSuccess) options.onSuccess();
        },
    });
};
