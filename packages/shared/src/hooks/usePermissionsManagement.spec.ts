const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        permissions: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            assignToRole: jest.fn().mockResolvedValue({ id: 'rp1' }),
            unassignFromRole: jest.fn().mockResolvedValue(undefined),
        }),
        roles: jest.fn().mockReturnValue({
            getRolePermissions: jest.fn().mockResolvedValue([]),
        }),
    },
}));

import {
    useAllPermissionsQuery,
    useRolePermissionsQuery,
    useAssignPermissionMutation,
    useUnassignPermissionMutation,
} from './usePermissionsManagement';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('usePermissionsManagement hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useAllPermissionsQuery', () => {
        it('should call useQuery with permissions catalog queryKey', () => {
            useAllPermissionsQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['permissions', 'catalog'],
                staleTime: 1000 * 60 * 5,
            }));
        });

        it('queryFn should call api.permissions().getAll', async () => {
            useAllPermissionsQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.permissions().getAll).toHaveBeenCalled();
        });
    });

    describe('useRolePermissionsQuery', () => {
        it('should call useQuery with role permissions queryKey', () => {
            useRolePermissionsQuery('company-1', 'role-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['roles', 'company-1', 'role-1', 'permissions'],
                enabled: true,
            }));
        });

        it('should disable query when companyId or roleId are missing', () => {
            useRolePermissionsQuery(undefined, undefined);
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('should disable query when only companyId is missing', () => {
            useRolePermissionsQuery(undefined, 'role-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.roles().getRolePermissions', async () => {
            useRolePermissionsQuery('company-1', 'role-1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.roles().getRolePermissions).toHaveBeenCalledWith('company-1', 'role-1');
        });
    });

    describe('useAssignPermissionMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useAssignPermissionMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.permissions().assignToRole', async () => {
            useAssignPermissionMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const vars = { roleId: 'r1', permissionId: 'p1', companyId: 'c1', _companyId: 'c1' };
            await call.mutationFn(vars);
            expect(api.permissions().assignToRole).toHaveBeenCalledWith({
                roleId: 'r1',
                permissionId: 'p1',
                companyId: 'c1',
            });
        });

        it('onSuccess should invalidate role permissions query', async () => {
            useAssignPermissionMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const vars = { roleId: 'r1', permissionId: 'p1', companyId: 'c1', _companyId: 'c1' };
            await call.onSuccess(undefined, vars);
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: ['roles', 'c1', 'r1', 'permissions'],
            });
        });
    });

    describe('useUnassignPermissionMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUnassignPermissionMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.permissions().unassignFromRole', async () => {
            useUnassignPermissionMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ roleId: 'r1', permissionId: 'p1', companyId: 'c1' });
            expect(api.permissions().unassignFromRole).toHaveBeenCalledWith('r1', 'p1');
        });

        it('onSuccess should invalidate role permissions query', async () => {
            useUnassignPermissionMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const vars = { roleId: 'r1', permissionId: 'p1', companyId: 'c1' };
            await call.onSuccess(undefined, vars);
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: ['roles', 'c1', 'r1', 'permissions'],
            });
        });
    });
});
