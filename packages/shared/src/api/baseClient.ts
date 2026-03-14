import axios, { AxiosInstance } from 'axios';

export interface TokenProvider {
    getToken: () => Promise<string | null> | string | null;
    setToken: (token: string) => Promise<void> | void;
    removeToken: () => Promise<void> | void;
    onUnauthorized?: () => void;
}

export const createApiClient = (
    baseURL: string,
    tokenProvider: TokenProvider
): AxiosInstance => {
    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    client.interceptors.request.use(
        async (config) => {
            const token = await tokenProvider.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                await tokenProvider.removeToken();
                if (tokenProvider.onUnauthorized) {
                    tokenProvider.onUnauthorized();
                }
            }
            return Promise.reject(error);
        }
    );

    return client;
};
