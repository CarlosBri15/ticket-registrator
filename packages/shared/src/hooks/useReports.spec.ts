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
            getOne: jest.fn().mockResolvedValue({ id: '1' }),
            create: jest.fn().mockResolvedValue({ id: 'new' }),
            submit: jest.fn().mockResolvedValue({ id: '1', status: 'Submitted' }),
            delete: jest.fn().mockResolvedValue(undefined),
        }),
    },
}));

import { useReportsQuery, useReportQuery, useCreateReportMutation, useSubmitReportMutation, useDeleteReportMutation } from './useReports';
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

    describe('useReportQuery', () => {
        it('should call useQuery with specific report queryKey', () => {
            useReportQuery('abc');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['reports', 'abc'],
                enabled: true,
            }));
        });

        it('should disable query when id is undefined', () => {
            useReportQuery(undefined);
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
