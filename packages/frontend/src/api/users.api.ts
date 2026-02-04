import type { ICreateUser } from '@ticket-registrator/shared';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData: ICreateUser) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
} 