const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        users: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'u1' }),
            update: jest.fn().mockResolvedValue({ id: 'u1' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));

import {
    useUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} from './useUsers';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useUsers hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useUsersQuery', () => {
        it('should call useQuery with users queryKey', () => {
            useUsersQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['users'],
            }));
        });

        it('queryFn should call api.users().getAll', async () => {
            useUsersQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.users().getAll).toHaveBeenCalled();
        });
    });

    describe('useCreateUserMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useCreateUserMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.users().create', async () => {
            useCreateUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const payload = { name: 'John', email: 'john@test.com' };
            await call.mutationFn(payload);
            expect(api.users().create).toHaveBeenCalledWith(payload);
        });

        it('onSuccess should invalidate users queries', async () => {
            useCreateUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
        });

        it('onSuccess should call options.onSuccess callback', async () => {
            const onSuccess = jest.fn();
            useCreateUserMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(onSuccess).toHaveBeenCalled();
        });

        it('onError should call options.onError callback', async () => {
            const onError = jest.fn();
            useCreateUserMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });
    });

    describe('useUpdateUserMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUpdateUserMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.users().update', async () => {
            useUpdateUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ id: 'u1', data: { name: 'Updated' } });
            expect(api.users().update).toHaveBeenCalledWith('u1', { name: 'Updated' });
        });

        it('onSuccess should invalidate queries', async () => {
            useUpdateUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
        });
    });

    describe('useDeleteUserMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteUserMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.users().delete', async () => {
            useDeleteUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('u1');
            expect(api.users().delete).toHaveBeenCalledWith('u1');
        });

        it('onSuccess should invalidate queries', async () => {
            useDeleteUserMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
        });
    });
});
