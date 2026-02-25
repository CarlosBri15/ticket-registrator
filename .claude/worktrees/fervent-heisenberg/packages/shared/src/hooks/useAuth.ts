import { useMutation, useQuery } from "@tanstack/react-query";
import { LoginSchema, ICreateUser } from '../index';
import { api } from '../api/clientContainer';

export const useLoginMutation = (options?: any) => {
    return useMutation({
        mutationFn: (credentials: LoginSchema) => api.auth().login(credentials),
        ...options
    });
};

export const useRegisterMutation = (options?: any) => {
    return useMutation({
        mutationFn: (userData: ICreateUser) => api.auth().register(userData),
        ...options
    });
};

export const useUserQuery = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => api.auth().getMe(),
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};
