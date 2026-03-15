import { createApiClient, TokenProvider } from './baseClient';
import axios from 'axios';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('createApiClient', () => {
    const mockRequestUse = jest.fn();
    const mockResponseUse = jest.fn();
    const mockAxiosInstance: any = {
        interceptors: {
            request: { use: mockRequestUse },
            response: { use: mockResponseUse },
        },
    };

    const tokenProvider: TokenProvider = {
        getToken: jest.fn(),
        setToken: jest.fn(),
        removeToken: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.create.mockReturnValue(mockAxiosInstance);
    });

    it('should create an axios instance with correct baseURL and headers', () => {
        createApiClient('https://api.example.com', tokenProvider);

        expect(mockAxios.create).toHaveBeenCalledWith({
            baseURL: 'https://api.example.com',
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('should register request and response interceptors', () => {
        createApiClient('https://api.example.com', tokenProvider);

        expect(mockRequestUse).toHaveBeenCalledTimes(1);
        expect(mockResponseUse).toHaveBeenCalledTimes(1);
    });

    it('should return the axios instance', () => {
        const result = createApiClient('https://api.example.com', tokenProvider);
        expect(result).toBe(mockAxiosInstance);
    });

    describe('request interceptor', () => {
        it('should add Authorization header when token is present', async () => {
            (tokenProvider.getToken as jest.Mock).mockResolvedValue('mytoken');
            createApiClient('https://api.example.com', tokenProvider);

            const [requestHandler] = mockRequestUse.mock.calls[0];
            const config = { headers: {} };
            const result = await requestHandler(config);

            expect(result.headers.Authorization).toBe('Bearer mytoken');
        });

        it('should not add Authorization header when token is null', async () => {
            (tokenProvider.getToken as jest.Mock).mockResolvedValue(null);
            createApiClient('https://api.example.com', tokenProvider);

            const [requestHandler] = mockRequestUse.mock.calls[0];
            const config = { headers: {} };
            const result = await requestHandler(config);

            expect(result.headers.Authorization).toBeUndefined();
        });

        it('should reject on request error', async () => {
            createApiClient('https://api.example.com', tokenProvider);

            const [, requestErrorHandler] = mockRequestUse.mock.calls[0];
            const error = new Error('Request setup error');
            await expect(requestErrorHandler(error)).rejects.toEqual(error);
        });
    });

    describe('response interceptor', () => {
        it('should pass through successful responses', () => {
            createApiClient('https://api.example.com', tokenProvider);

            const [responseHandler] = mockResponseUse.mock.calls[0];
            const response = { data: { id: 1 }, status: 200 };
            expect(responseHandler(response)).toBe(response);
        });

        it('should call removeToken and onUnauthorized on 401', async () => {
            const onUnauthorized = jest.fn();
            const providerWithCallback: TokenProvider = {
                ...tokenProvider,
                removeToken: jest.fn(),
                onUnauthorized,
            };
            createApiClient('https://api.example.com', providerWithCallback);

            const [, responseErrorHandler] = mockResponseUse.mock.calls[0];
            const error = { response: { status: 401 } };

            await expect(responseErrorHandler(error)).rejects.toEqual(error);
            expect(providerWithCallback.removeToken).toHaveBeenCalled();
            expect(onUnauthorized).toHaveBeenCalled();
        });

        it('should not call removeToken on non-401 errors', async () => {
            const removeToken = jest.fn();
            const provider: TokenProvider = { ...tokenProvider, removeToken };
            createApiClient('https://api.example.com', provider);

            const [, responseErrorHandler] = mockResponseUse.mock.calls[0];
            const error = { response: { status: 500 } };

            await expect(responseErrorHandler(error)).rejects.toEqual(error);
            expect(removeToken).not.toHaveBeenCalled();
        });

        it('should handle errors without response object', async () => {
            createApiClient('https://api.example.com', tokenProvider);

            const [, responseErrorHandler] = mockResponseUse.mock.calls[0];
            const error = new Error('Network Error');

            await expect(responseErrorHandler(error)).rejects.toEqual(error);
        });
    });
});
