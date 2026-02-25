import { AxiosInstance } from 'axios';
import { authApi } from './auth';
import { reportsApi } from './reports';
import { ticketsApi } from './tickets';

let client: AxiosInstance | null = null;

export const setApiClient = (axiosInstance: AxiosInstance) => {
    client = axiosInstance;
};

export const getApiClient = () => {
    if (!client) {
        throw new Error("ApiClient not initialized. Call setApiClient first.");
    }
    return client;
};

export const api = {
    auth: () => authApi(getApiClient()),
    reports: () => reportsApi(getApiClient()),
    tickets: () => ticketsApi(getApiClient()),
};