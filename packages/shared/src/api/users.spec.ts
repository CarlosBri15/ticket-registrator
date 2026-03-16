import { usersApi } from './users';

describe('usersApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };

    const api = usersApi(mockClient as any);

    beforeEach(() => jest.clearAllMocks());

    describe('getAll', () => {
        it('should call GET /users', async () => {
            const data = [{ id: 'u1', name: 'John' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getAll();

            expect(mockClient.get).toHaveBeenCalledWith('/users');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(api.getAll()).rejects.toThrow('Unauthorized');
        });
    });

    describe('create', () => {
        it('should call POST /users', async () => {
            const user = { id: 'u1', name: 'John' };
            const payload = { name: 'John', email: 'john@test.com' };
            mockClient.post.mockResolvedValue({ data: user });

            const result = await api.create(payload as any);

            expect(mockClient.post).toHaveBeenCalledWith('/users', payload);
            expect(result).toEqual(user);
        });

        it('should propagate errors', async () => {
            mockClient.post.mockRejectedValue(new Error('Conflict'));
            await expect(api.create({} as any)).rejects.toThrow('Conflict');
        });
    });

    describe('update', () => {
        it('should call PATCH /users/:id', async () => {
            const user = { id: 'u1', name: 'Updated' };
            mockClient.patch.mockResolvedValue({ data: user });

            const result = await api.update('u1', { name: 'Updated' } as any);

            expect(mockClient.patch).toHaveBeenCalledWith('/users/u1', { name: 'Updated' });
            expect(result).toEqual(user);
        });

        it('should propagate errors', async () => {
            mockClient.patch.mockRejectedValue(new Error('Not found'));
            await expect(api.update('u1', {} as any)).rejects.toThrow('Not found');
        });
    });

    describe('delete', () => {
        it('should call DELETE /users/:id', async () => {
            mockClient.delete.mockResolvedValue({});

            await api.delete('u1');

            expect(mockClient.delete).toHaveBeenCalledWith('/users/u1');
        });

        it('should propagate errors', async () => {
            mockClient.delete.mockRejectedValue(new Error('Forbidden'));
            await expect(api.delete('u1')).rejects.toThrow('Forbidden');
        });
    });
});
