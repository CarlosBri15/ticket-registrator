const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        departments: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'd1', name: 'HR' }),
            update: jest.fn().mockResolvedValue({ id: 'd1', name: 'Updated HR' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));

import {
    useDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} from './useDepartments';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useDepartments hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useDepartmentsQuery', () => {
        it('should call useQuery with departments queryKey', () => {
            useDepartmentsQuery('company-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['departments', 'company-1'],
                enabled: true,
            }));
        });

        it('should disable query when companyId is undefined', () => {
            useDepartmentsQuery(undefined);
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.departments().getAll', async () => {
            useDepartmentsQuery('company-1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.departments().getAll).toHaveBeenCalledWith('company-1');
        });
    });

    describe('useCreateDepartmentMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useCreateDepartmentMutation('company-1');
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.departments().create', async () => {
            useCreateDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ name: 'HR' });
            expect(api.departments().create).toHaveBeenCalledWith('company-1', { name: 'HR' });
        });

        it('onSuccess should invalidate departments queries', async () => {
            useCreateDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['departments', 'company-1'] });
        });

        it('onSuccess should call options.onSuccess callback', async () => {
            const onSuccess = jest.fn();
            useCreateDepartmentMutation('company-1', { onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(onSuccess).toHaveBeenCalled();
        });

        it('onError should call options.onError callback', async () => {
            const onError = jest.fn();
            useCreateDepartmentMutation('company-1', { onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });
    });

    describe('useUpdateDepartmentMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUpdateDepartmentMutation('company-1');
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.departments().update', async () => {
            useUpdateDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ id: 'd1', data: { name: 'Updated' } });
            expect(api.departments().update).toHaveBeenCalledWith('company-1', 'd1', { name: 'Updated' });
        });

        it('onSuccess should invalidate queries', async () => {
            useUpdateDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['departments', 'company-1'] });
        });

        it('onError should call options.onError callback', async () => {
            const onError = jest.fn();
            useUpdateDepartmentMutation('company-1', { onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });
    });

    describe('useDeleteDepartmentMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteDepartmentMutation('company-1');
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.departments().delete', async () => {
            useDeleteDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('d1');
            expect(api.departments().delete).toHaveBeenCalledWith('company-1', 'd1');
        });

        it('onSuccess should invalidate queries', async () => {
            useDeleteDepartmentMutation('company-1');
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['departments', 'company-1'] });
        });
    });
});
