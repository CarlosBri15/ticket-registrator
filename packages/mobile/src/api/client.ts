import * as SecureStore from 'expo-secure-store';
import { createApiClient, type TokenProvider, setApiClient } from '@ticket-registrator/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const tokenProvider: TokenProvider = {
    getToken: async () => {
        return await SecureStore.getItemAsync('access_token');
    },
    setToken: async (token: string) => {
        await SecureStore.setItemAsync('access_token', token);
    },
    removeToken: async () => {
        await SecureStore.deleteItemAsync('access_token');
    },
    onUnauthorized: () => {
        // Aquí podríamos disparar un evento global o usar un contexto para navegar al login
        console.log("Unauthorized - Token removed");
    }
};

export const initApi = () => {
    const client = createApiClient(API_URL, tokenProvider);
    setApiClient(client);
    return client;
};

export { tokenProvider };