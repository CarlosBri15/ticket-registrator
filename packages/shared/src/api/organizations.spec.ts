import { organizationsApi } from './organizations';

describe('organizationsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };

    const api = organizationsApi(mockClient as any);

    beforeEach(() => jest.clearAllMocks());

    describe('getAll', () => {
        it('should call GET /organizations', async () => {
            const data = [{ id: 'org-1', name: 'Acme' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getAll();

            expect(mockClient.get).toHaveBeenCalledWith('/organizations');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(api.getAll()).rejects.toThrow('Unauthorized');
        });
    });

    describe('onboard', () => {
        it('should call POST /organizations/onboard', async () => {
            const payload = { name: 'Acme Corp', adminEmail: 'admin@acme.com' };
            const responseData = { organizationId: 'org-1', userId: 'u-1' };
            mockClient.post.mockResolvedValue({ data: responseData });

            const result = await api.onboard(payload as any);

            expect(mockClient.post).toHaveBeenCalledWith('/organizations/onboard', payload);
            expect(result).toEqual(responseData);
        });

        it('should propagate errors', async () => {
            mockClient.post.mockRejectedValue(new Error('Conflict'));
            await expect(api.onboard({} as any)).rejects.toThrow('Conflict');
        });
    });

    describe('update', () => {
        it('should call PATCH /organizations/:id', async () => {
            const org = { id: 'org-1', name: 'Acme Updated' };
            mockClient.patch.mockResolvedValue({ data: org });

            const result = await api.update('org-1', { name: 'Acme Updated' } as any);

            expect(mockClient.patch).toHaveBeenCalledWith('/organizations/org-1', { name: 'Acme Updated' });
            expect(result).toEqual(org);
        });

        it('should propagate errors', async () => {
            mockClient.patch.mockRejectedValue(new Error('Not found'));
            await expect(api.update('org-1', {} as any)).rejects.toThrow('Not found');
        });
    });

    describe('delete', () => {
        it('should call DELETE /organizations/:id', async () => {
            mockClient.delete.mockResolvedValue({});

            await api.delete('org-1');

            expect(mockClient.delete).toHaveBeenCalledWith('/organizations/org-1');
        });

        it('should propagate errors', async () => {
            mockClient.delete.mockRejectedValue(new Error('Forbidden'));
            await expect(api.delete('org-1')).rejects.toThrow('Forbidden');
        });
    });
});
