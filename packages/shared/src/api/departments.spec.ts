import { departmentsApi } from './departments';

describe('departmentsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };

    const api = departmentsApi(mockClient as any);

    beforeEach(() => jest.clearAllMocks());

    describe('getAll', () => {
        it('should call GET /organizations/:companyId/departments', async () => {
            const data = [{ id: 'd1', name: 'HR' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getAll('company-1');

            expect(mockClient.get).toHaveBeenCalledWith('/organizations/company-1/departments');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Network error'));
            await expect(api.getAll('company-1')).rejects.toThrow('Network error');
        });
    });

    describe('create', () => {
        it('should call POST /organizations/:companyId/departments', async () => {
            const dept = { id: 'd1', name: 'HR' };
            mockClient.post.mockResolvedValue({ data: dept });

            const result = await api.create('company-1', { name: 'HR' } as any);

            expect(mockClient.post).toHaveBeenCalledWith('/organizations/company-1/departments', { name: 'HR' });
            expect(result).toEqual(dept);
        });

        it('should propagate errors', async () => {
            mockClient.post.mockRejectedValue(new Error('Conflict'));
            await expect(api.create('company-1', { name: 'HR' } as any)).rejects.toThrow('Conflict');
        });
    });

    describe('update', () => {
        it('should call PATCH /organizations/:companyId/departments/:id', async () => {
            const dept = { id: 'd1', name: 'Updated HR' };
            mockClient.patch.mockResolvedValue({ data: dept });

            const result = await api.update('company-1', 'd1', { name: 'Updated HR' } as any);

            expect(mockClient.patch).toHaveBeenCalledWith('/organizations/company-1/departments/d1', { name: 'Updated HR' });
            expect(result).toEqual(dept);
        });

        it('should propagate errors', async () => {
            mockClient.patch.mockRejectedValue(new Error('Not found'));
            await expect(api.update('c1', 'd1', {} as any)).rejects.toThrow('Not found');
        });
    });

    describe('delete', () => {
        it('should call DELETE /organizations/:companyId/departments/:id', async () => {
            mockClient.delete.mockResolvedValue({});

            await api.delete('company-1', 'd1');

            expect(mockClient.delete).toHaveBeenCalledWith('/organizations/company-1/departments/d1');
        });

        it('should propagate errors', async () => {
            mockClient.delete.mockRejectedValue(new Error('Forbidden'));
            await expect(api.delete('c1', 'd1')).rejects.toThrow('Forbidden');
        });
    });
});
