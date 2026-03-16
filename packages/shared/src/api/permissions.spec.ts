import { permissionsApi } from './permissions';

describe('permissionsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
    };

    const api = permissionsApi(mockClient as any);

    beforeEach(() => jest.clearAllMocks());

    describe('getAll', () => {
        it('should call GET /permissions', async () => {
            const data = [{ id: 'p1', name: 'view_users' }];
            mockClient.get.mockResolvedValue({ data });

            const result = await api.getAll();

            expect(mockClient.get).toHaveBeenCalledWith('/permissions');
            expect(result).toEqual(data);
        });

        it('should propagate errors', async () => {
            mockClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(api.getAll()).rejects.toThrow('Unauthorized');
        });
    });

    describe('assignToRole', () => {
        it('should call POST /permissions/assign-role', async () => {
            const payload = { roleId: 'role-1', permissionId: 'perm-1', companyId: 'company-1' };
            const responseData = { id: 'rp1', roleId: 'role-1', permissionId: 'perm-1' };
            mockClient.post.mockResolvedValue({ data: responseData });

            const result = await api.assignToRole(payload as any);

            expect(mockClient.post).toHaveBeenCalledWith('/permissions/assign-role', payload);
            expect(result).toEqual(responseData);
        });

        it('should propagate errors', async () => {
            mockClient.post.mockRejectedValue(new Error('Conflict'));
            await expect(api.assignToRole({} as any)).rejects.toThrow('Conflict');
        });
    });

    describe('unassignFromRole', () => {
        it('should call DELETE with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await api.unassignFromRole('role-1', 'perm-1');

            expect(mockClient.delete).toHaveBeenCalledWith(
                '/permissions/unassign-role/role/role-1/permission/perm-1',
            );
        });

        it('should propagate errors', async () => {
            mockClient.delete.mockRejectedValue(new Error('Not found'));
            await expect(api.unassignFromRole('r1', 'p1')).rejects.toThrow('Not found');
        });
    });
});
