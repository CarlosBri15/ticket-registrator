import { authApi } from './auth';

describe('authApi', () => {
    const mockClient = {
        post: jest.fn(),
        get: jest.fn(),
    };

    const api = authApi(mockClient as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should call POST /auth/login with credentials', async () => {
            const credentials = { email: 'test@test.com', password: 'password123' };
            const responseData = { access_token: 'token123' };
            mockClient.post.mockResolvedValue({ data: responseData });

            const result = await api.login(credentials);

            expect(mockClient.post).toHaveBeenCalledWith('/auth/login', credentials);
            expect(result).toEqual(responseData);
        });

        it('should propagate errors from login', async () => {
            mockClient.post.mockRejectedValue(new Error('Network error'));
            await expect(api.login({ email: 'test@test.com', password: 'pass' })).rejects.toThrow('Network error');
        });
    });

    describe('register', () => {
        it('should call POST /users with user data', async () => {
            const userData = {
                name: 'John', surname: 'Doe', email: 'john@test.com',
                username: 'johndoe', password: 'pass1234', confirmPassword: 'pass1234',
            };
            const responseData = { id: '1', ...userData };
            mockClient.post.mockResolvedValue({ data: responseData });

            const result = await api.register(userData);

            expect(mockClient.post).toHaveBeenCalledWith('/users', userData);
            expect(result).toEqual(responseData);
        });
    });

    describe('getMe', () => {
        it('should call GET /users/me', async () => {
            const user = { id: '1', name: 'John', email: 'john@test.com' };
            mockClient.get.mockResolvedValue({ data: user });

            const result = await api.getMe();

            expect(mockClient.get).toHaveBeenCalledWith('/users/me');
            expect(result).toEqual(user);
        });

        it('should propagate errors from getMe', async () => {
            mockClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(api.getMe()).rejects.toThrow('Unauthorized');
        });
    });
});
