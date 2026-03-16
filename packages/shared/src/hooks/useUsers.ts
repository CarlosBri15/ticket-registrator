import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { CreateUserSchema } from '../schemas/users/createUser.schema';
import { UpdateUserSchema } from '../schemas/users/updateUser.schema';

export const useUsersQuery = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => api.users().getAll(),
    });
};

export const useCreateUserMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserSchema) => api.users().create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useUpdateUserMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserSchema }) =>
            api.users().update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            if (options?.onSuccess) options.onSuccess();
        },
        onError: (error: any) => {
            if (options?.onError) options.onError(error);
        },
    });
};

export const useDeleteUserMutation = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.users().delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            if (options?.onSuccess) options.onSuccess();
        },
    });
};
