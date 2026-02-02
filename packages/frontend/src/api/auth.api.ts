import type { ICreateUser, ILogin, ILoginResponse, IUser } from '@ticket-registrator/shared';
import { client } from './client';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData: ICreateUser): Promise<IUser> => {
    const response = await client.post<IUser>(`${API_URL}/users`, userData);
    return response.data;
} 

export const loginUser = async (credentials: ILogin) : Promise<ILoginResponse> => {
    const response = await client.post<ILoginResponse>(`${API_URL}/auth/login`, credentials);
    return response.data;
}