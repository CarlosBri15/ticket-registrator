const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        organizations: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            onboard: jest.fn().mockResolvedValue({ organizationId: 'org-1', userId: 'u-1' }),
            update: jest.fn().mockResolvedValue({ id: 'org-1', name: 'Updated' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));
import {
    useOrganizationsQuery,
    useOnboardOrganizationMutation,
    useUpdateOrganizationMutation,
    useDeleteOrganizationMutation,
    useOrganizationQuery,
} from './useOrganizations';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useOrganizations hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useOrganizationsQuery', () => {
        it('should call useQuery with organizations queryKey', () => {
            useOrganizationsQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['organizations'],
            }));
        });

        it('queryFn should call api.organizations().getAll', async () => {
            useOrganizationsQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.organizations().getAll).toHaveBeenCalled();
        });
    });

    describe('useOnboardOrganizationMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useOnboardOrganizationMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.organizations().onboard', async () => {
            useOnboardOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const payload = { name: 'Acme', adminEmail: 'admin@acme.com' };
            await call.mutationFn(payload);
            expect(api.organizations().onboard).toHaveBeenCalledWith(payload);
        });

        it('onSuccess should invalidate organizations queries', async () => {
            useOnboardOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess({ organizationId: 'org-1' });
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['organizations'] });
        });

        it('onSuccess should call options.onSuccess callback with data', async () => {
            const onSuccess = jest.fn();
            useOnboardOrganizationMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { organizationId: 'org-1', userId: 'u-1' };
            await call.onSuccess(data);
            expect(onSuccess).toHaveBeenCalledWith(data);
        });

        it('onError should call options.onError callback', async () => {
            const onError = jest.fn();
            useOnboardOrganizationMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });
    });

    describe('useUpdateOrganizationMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUpdateOrganizationMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.organizations().update', async () => {
            useUpdateOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ id: 'org-1', data: { name: 'Updated' } });
            expect(api.organizations().update).toHaveBeenCalledWith('org-1', { name: 'Updated' });
        });

        it('onSuccess should invalidate queries', async () => {
            useUpdateOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['organizations'] });
        });

        it('onError should call options.onError callback', async () => {
            const onError = jest.fn();
            useUpdateOrganizationMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const err = new Error('fail');
            await call.onError(err);
            expect(onError).toHaveBeenCalledWith(err);
        });
    });

    describe('useDeleteOrganizationMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteOrganizationMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.organizations().delete', async () => {
            useDeleteOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('org-1');
            expect(api.organizations().delete).toHaveBeenCalledWith('org-1');
        });

        it('onSuccess should invalidate queries', async () => {
            useDeleteOrganizationMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['organizations'] });
        });
    });

    describe('useOrganizationQuery', () => {
        it('should call useQuery with correct options', () => {
            useOrganizationQuery('org-1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['organizations'],
                enabled: true,
            }));
        });

        it('queryFn should call api.organizations().getAll', async () => {
            useOrganizationQuery('org-1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.organizations().getAll).toHaveBeenCalled();
        });

        it('select should filter organizations by id', () => {
            useOrganizationQuery('org-2');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            const orgs = [{ id: 'org-1' }, { id: 'org-2' }] as any[];
            const selected = call.select(orgs);
            expect(selected).toEqual({ id: 'org-2' });
        });
    });
});
