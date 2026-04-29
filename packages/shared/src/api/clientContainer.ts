import { AxiosInstance } from 'axios';
import { authApi } from './auth';
import { reportsApi } from './reports';
import { ticketsApi } from './tickets';
import { usersApi } from './users';
import { departmentsApi } from './departments';
import { rolesApi } from './roles';
import { organizationsApi } from './organizations';
import { permissionsApi } from './permissions';
import { categoriesApi } from './categories';

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
    users: () => usersApi(getApiClient()),
    departments: () => departmentsApi(getApiClient()),
    roles: () => rolesApi(getApiClient()),
    organizations: () => organizationsApi(getApiClient()),
    permissions: () => permissionsApi(getApiClient()),
    categories: () => categoriesApi(getApiClient()),
};