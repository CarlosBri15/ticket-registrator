import { AxiosInstance } from 'axios';
import { LoginSchema, ILoginResponse, ICreateUser, IUser } from '../index';

export const authApi = (client: AxiosInstance) => ({
    login: async (credentials: LoginSchema): Promise<ILoginResponse> => {
        const response = await client.post<ILoginResponse>('/auth/login', credentials);
        return response.data;
    },
    register: async (userData: ICreateUser): Promise<IUser> => {
        const response = await client.post<IUser>('/users', userData);
        return response.data;
    },
    getMe: async (): Promise<IUser> => {
        const response = await client.get<IUser>('/users/me');
        return response.data;
    }
});
