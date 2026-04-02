const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        reports: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            getPaginated: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
            getOne: jest.fn().mockResolvedValue({ id: '1' }),
            create: jest.fn().mockResolvedValue({ id: 'new' }),
            submit: jest.fn().mockResolvedValue({ id: '1', status: 'Submitted' }),
            updateStatus: jest.fn().mockResolvedValue({ id: '1', status: 'Approved' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));

import { useReportsQuery, useReportsPaginatedQuery, useReportQuery, useCreateReportMutation, useSubmitReportMutation, useDeleteReportMutation, useUpdateReportStatusMutation } from './useReports';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useReports hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useReportsQuery', () => {
        it('should call useQuery with reports queryKey', () => {
            useReportsQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['reports'],
            }));
        });

        it('queryFn should call api.reports().getAll', async () => {
            useReportsQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.reports().getAll).toHaveBeenCalled();
        });
    });

    describe('useReportsPaginatedQuery', () => {
        it('should call useQuery with paginated queryKey', () => {
            const params = { page: 1, limit: 10 };
            useReportsPaginatedQuery(params);
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['reports', 'paginated', params],
            }));
        });

        it('queryFn should call api.reports().getPaginated with params', async () => {
            const params = { page: 1, limit: 10 };
            useReportsPaginatedQuery(params);
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.reports().getPaginated).toHaveBeenCalledWith(params);
        });
    });

    describe('useReportQuery', () => {
        it('should call useQuery with specific report queryKey', () => {
            useReportQuery('abc');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['reports', 'abc'],
                enabled: true,
            }));
        });

        it('should disable query when id is undefined', () => {
            useReportQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.reports().getOne with id', async () => {
            useReportQuery('abc');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.reports().getOne).toHaveBeenCalledWith('abc');
        });
    });

    describe('useCreateReportMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useCreateReportMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.reports().create', async () => {
            useCreateReportMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { name: 'Trip', start_date: new Date(), end_date: new Date(), currency: 'EUR' };
            await call.mutationFn(data);
            expect(api.reports().create).toHaveBeenCalledWith(data);
        });

        it('onSuccess should invalidate reports queries', async () => {
            const onSuccess = jest.fn();
            useCreateReportMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['reports'] });
            expect(onSuccess).toHaveBeenCalled();
        });

        it('onError should call options.onError if provided', async () => {
            const onError = jest.fn();
            useCreateReportMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const error = new Error('Failed');
            await call.onError(error);
            expect(onError).toHaveBeenCalledWith(error);
        });
    });

    describe('useSubmitReportMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useSubmitReportMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.reports().submit', async () => {
            useSubmitReportMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('report1');
            expect(api.reports().submit).toHaveBeenCalledWith('report1');
        });

        it('onSuccess should invalidate reports queries', async () => {
            const onSuccess = jest.fn();
            useSubmitReportMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { id: '1' };
            await call.onSuccess(data, 'report1');
            expect(mockInvalidateQueries).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalledWith(data);
        });

        it('onError should call options.onError if provided', async () => {
            const onError = jest.fn();
            useSubmitReportMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onError(new Error('err'));
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('useUpdateReportStatusMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUpdateReportStatusMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.reports().updateStatus with id and status', async () => {
            useUpdateReportStatusMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ id: 'report1', status: 'Approved' });
            expect(api.reports().updateStatus).toHaveBeenCalledWith('report1', 'Approved');
        });

        it('onSuccess should invalidate reports and specific report queries', async () => {
            const onSuccess = jest.fn();
            useUpdateReportStatusMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { id: 'report1', status: 'Approved' };
            await call.onSuccess(data, { id: 'report1', status: 'Approved' });
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['reports'] });
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['reports', 'report1'] });
            expect(onSuccess).toHaveBeenCalledWith(data);
        });

        it('onSuccess should not throw when no options provided', () => {
            useUpdateReportStatusMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            expect(() => call.onSuccess({ id: 'r1' }, { id: 'r1', status: 'Approved' })).not.toThrow();
        });

        it('onError should call options.onError if provided', async () => {
            const onError = jest.fn();
            useUpdateReportStatusMutation({ onError });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const error = new Error('Status update failed');
            await call.onError(error);
            expect(onError).toHaveBeenCalledWith(error);
        });

        it('onError should not throw when no options provided', () => {
            useUpdateReportStatusMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            expect(() => call.onError(new Error('err'))).not.toThrow();
        });
    });

    describe('useDeleteReportMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteReportMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.reports().delete', async () => {
            useDeleteReportMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn('report1');
            expect(api.reports().delete).toHaveBeenCalledWith('report1');
        });

        it('onSuccess should invalidate reports queries', async () => {
            const onSuccess = jest.fn();
            useDeleteReportMutation({ onSuccess });
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess();
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['reports'] });
            expect(onSuccess).toHaveBeenCalled();
        });
    });
});
