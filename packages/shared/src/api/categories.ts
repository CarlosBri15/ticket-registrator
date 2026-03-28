import { AxiosInstance } from 'axios';
import { ICategory } from '../interfaces/categories/category.interface';

export const categoriesApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<ICategory[]> => {
        const response = await client.get<ICategory[]>('/categories');
        return response.data;
    },
    get: async (id: string): Promise<ICategory> => {
        const response = await client.get<ICategory>(`/categories/${id}`);
        return response.data;
    },
    create: async (data: any): Promise<ICategory> => {
        const response = await client.post<ICategory>('/categories', data);
        return response.data;
    },
    update: async (id: string, data: any): Promise<ICategory> => {
        const response = await client.patch<ICategory>(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await client.delete(`/categories/${id}`);
    }
});
