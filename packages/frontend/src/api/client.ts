import { createApiClient, type TokenProvider, setApiClient } from '@ticket-registrator/shared';

const API_URL = import.meta.env.VITE_API_URL;

const tokenProvider: TokenProvider = {
    getToken: () => {
        return localStorage.getItem('access_token');
    },
    setToken: (token: string) => {
        localStorage.setItem('access_token', token);
    },
    removeToken: () => {
        localStorage.removeItem('access_token');
    },
    onUnauthorized: () => {
        window.location.href = '/login';
    }
};

const client = createApiClient(API_URL, tokenProvider);
setApiClient(client);

export { client, tokenProvider };
