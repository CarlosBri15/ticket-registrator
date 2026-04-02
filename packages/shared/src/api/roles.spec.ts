import { rolesApi } from './roles';

describe('rolesApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
    };

    const api = rolesApi(mockClient as any);

    beforeEach(() => jest.clearAllMocks());

    describe('getSystem', () => {
        it('should call GET /roles', async () => {
            const data = [{ id: 'r1', name: 'Admin' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getSystem();

            expect(mockClient.get).toHaveBeenCalledWith('/roles');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(api.getSystem()).rejects.toThrow('Unauthorized');
        });
    });

    describe('getByCompany', () => {
        it('should call GET /organizations/:companyId/roles', async () => {
            const data = [{ id: 'r1', name: 'Manager' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getByCompany('company-1');

            expect(mockClient.get).toHaveBeenCalledWith('/organizations/company-1/roles');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Not found'));
            await expect(api.getByCompany('company-1')).rejects.toThrow('Not found');
        });
    });

    describe('create', () => {
        it('should call POST /organizations/:companyId/roles', async () => {
            const role = { id: 'r2', name: 'Custom Role' };
            mockClient.post.mockResolvedValue({ data: role });

            const result = await api.create('company-1', { name: 'Custom Role' } as any);

            expect(mockClient.post).toHaveBeenCalledWith('/organizations/company-1/roles', { name: 'Custom Role' });
            expect(result).toEqual(role);
        });

        it('should propagate errors', async () => {
            mockClient.post.mockRejectedValue(new Error('Conflict'));
            await expect(api.create('c1', {} as any)).rejects.toThrow('Conflict');
        });
    });

    describe('delete', () => {
        it('should call DELETE /organizations/:companyId/roles/:id', async () => {
            mockClient.delete.mockResolvedValue({});

            await api.delete('company-1', 'role-1');

            expect(mockClient.delete).toHaveBeenCalledWith('/organizations/company-1/roles/role-1');
        });

        it('should propagate errors', async () => {
            mockClient.delete.mockRejectedValue(new Error('Forbidden'));
            await expect(api.delete('c1', 'r1')).rejects.toThrow('Forbidden');
        });
    });

    describe('getRolePermissions', () => {
        it('should call GET /organizations/:companyId/roles/:roleId/permissions', async () => {
            const perms = [{ id: 'p1', name: 'view_users' }];
            mockClient.get.mockResolvedValue({ data: perms });

            const result = await api.getRolePermissions('company-1', 'role-1');

            expect(mockClient.get).toHaveBeenCalledWith('/organizations/company-1/roles/role-1/permissions');
            expect(result).toEqual(perms);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Not found'));
            await expect(api.getRolePermissions('c1', 'r1')).rejects.toThrow('Not found');
        });
    });
});
