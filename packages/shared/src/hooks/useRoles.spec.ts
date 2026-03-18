const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        roles: jest.fn().mockReturnValue({
            getSystem: jest.fn().mockResolvedValue([]),
            getByCompany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'role-1', name: 'Dev' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));

import {
    useSystemRolesQuery,
    useRolesQuery,
    useCreateRoleMutation,
    useDeleteRoleMutation,
} from './useRoles';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useRoles hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useSystemRolesQuery', () => {
        it('should call useQuery with [roles, system] queryKey', () => {
            useSystemRolesQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['roles', 'system'],
            }));
        });

        it('queryFn should call api.roles().getSystem', async () => {
            useSystemRolesQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.roles().getSystem).toHaveBeenCalled();
        });
    });

    describe('useRolesQuery', () => {
        it('should call useQuery with [roles, companyId] queryKey', () => {
            useRolesQuery('company-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['roles', 'company-1'],
            }));
        });

        it('should be enabled when companyId is provided', () => {
            useRolesQuery('company-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: true,
            }));
        });

        it('should be disabled when companyId is undefined', () => {
            useRolesQuery(undefined);
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.roles().getByCompany', async () => {
            useRolesQuery('company-1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.roles().getByCompany).toHaveBeenCalledWith('company-1');
        });
    });

    describe('useCreateRoleMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useCreateRoleMutation('company-1');
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.roles().create', async () => {
            useCreateRoleMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { name: 'Dev', hierarchy: 20 };
            await call.mutationFn(data);
            expect(api.roles().create).toHaveBeenCalledWith('company-1', data);
        });

        it('onSuccess should invalidate roles query and call options.onSuccess', async () => {
            const onSuccess = jest.fn();
            useCreateRoleMutation('company-1', { onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['roles', 'company-1'] });
            expect(onSuccess).toHaveBeenCalled();
        });

        it('onError should call options.onError with the error', async () => {
            const onError = jest.fn();
            useCreateRoleMutation('company-1', { onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });

        it('onSuccess does not throw when options is undefined', () => {
            useCreateRoleMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            expect(() => call.onSuccess()).not.toThrow();
        });
    });

    describe('useDeleteRoleMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteRoleMutation('company-1');
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.roles().delete', async () => {
            useDeleteRoleMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('role-1');
            expect(api.roles().delete).toHaveBeenCalledWith('company-1', 'role-1');
        });

        it('onSuccess should invalidate roles query and call options.onSuccess', async () => {
            const onSuccess = jest.fn();
            useDeleteRoleMutation('company-1', { onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['roles', 'company-1'] });
            expect(onSuccess).toHaveBeenCalled();
        });
    });
});
