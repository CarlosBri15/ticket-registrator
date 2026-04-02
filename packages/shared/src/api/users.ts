import { AxiosInstance } from 'axios';
import { IUser } from '../interfaces/users/user.interface';
import { CreateUserSchema } from '../schemas/users/createUser.schema';
import { UpdateUserSchema } from '../schemas/users/updateUser.schema';

export const usersApi = (client: AxiosInstance) => ({
    getAll: async (): Promise<IUser[]> => {
        const response = await client.get<IUser[]>('/users');
        return response.data;
    },
    create: async (data: CreateUserSchema): Promise<IUser> => {
        const response = await client.post<IUser>('/users', data);
        return response.data;
    },
    update: async (id: string, data: UpdateUserSchema): Promise<IUser> => {
        const response = await client.patch<IUser>(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await client.delete(`/users/${id}`);
    },
});
