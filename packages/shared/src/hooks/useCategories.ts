import { useQuery } from "@tanstack/react-query";
import { api } from '../api/clientContainer';

export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => api.categories().getAll(),
    });
};

export const useCategoryQuery = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => api.categories().get(id),
        enabled: !!id,
    });
};
