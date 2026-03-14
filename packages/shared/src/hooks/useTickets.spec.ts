const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
    useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        tickets: jest.fn().mockReturnValue({
            getByReport: jest.fn().mockResolvedValue([]),
            get: jest.fn().mockResolvedValue({ id: 't1' }),
            upload: jest.fn().mockResolvedValue({ id: 't1' }),
            update: jest.fn().mockResolvedValue({ id: 't1' }),
            delete: jest.fn().mockResolvedValue(undefined),
            getImageUrl: jest.fn().mockResolvedValue({ url: 'https://example.com/img.jpg' }),
        }),
    },
}));

import { useTicketsQuery, useTicketQuery, useUploadTicketMutation, useUpdateTicketMutation, useDeleteTicketMutation, useTicketImageQuery } from './useTickets';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useTickets hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries.mockClear();
    });

    describe('useTicketsQuery', () => {
        it('should call useQuery with tickets queryKey', () => {
            useTicketsQuery('report1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['tickets', 'report1'],
                enabled: true,
            }));
        });

        it('should disable query when reportId is empty', () => {
            useTicketsQuery('');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.tickets().getByReport', async () => {
            useTicketsQuery('report1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.tickets().getByReport).toHaveBeenCalledWith('report1');
        });
    });

    describe('useTicketQuery', () => {
        it('should call useQuery with specific ticket queryKey', () => {
            useTicketQuery('r1', 't1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['tickets', 'r1', 't1'],
                enabled: true,
            }));
        });

        it('should disable query when ids are empty', () => {
            useTicketQuery('', '');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.tickets().get', async () => {
            useTicketQuery('r1', 't1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.tickets().get).toHaveBeenCalledWith('r1', 't1');
        });
    });

    describe('useUploadTicketMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUploadTicketMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.tickets().upload', async () => {
            useUploadTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const formData = new FormData();
            await call.mutationFn({ reportId: 'r1', formData });
            expect(api.tickets().upload).toHaveBeenCalledWith('r1', formData);
        });

        it('onSuccess should invalidate queries', async () => {
            // Call without options so internal onSuccess is not overridden by ...options spread
            useUploadTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { id: 't1' };
            await call.onSuccess(data, { reportId: 'r1', formData: new FormData() });
            expect(mockInvalidateQueries).toHaveBeenCalled();
        });
    });

    describe('useUpdateTicketMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useUpdateTicketMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.tickets().update', async () => {
            useUpdateTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ reportId: 'r1', ticketId: 't1', data: { amount: 50 } });
            expect(api.tickets().update).toHaveBeenCalledWith('r1', 't1', { amount: 50 });
        });

        it('onSuccess should invalidate queries', async () => {
            useUpdateTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const data = { id: 't1' };
            await call.onSuccess(data, { reportId: 'r1', ticketId: 't1', data: {} });
            expect(mockInvalidateQueries).toHaveBeenCalled();
        });
    });

    describe('useDeleteTicketMutation', () => {
        it('should call useMutation with mutationFn', () => {
            useDeleteTicketMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.tickets().delete', async () => {
            useDeleteTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.mutationFn({ reportId: 'r1', ticketId: 't1' });
            expect(api.tickets().delete).toHaveBeenCalledWith('r1', 't1');
        });

        it('onSuccess should invalidate queries', async () => {
            useDeleteTicketMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            await call.onSuccess(undefined, { reportId: 'r1', ticketId: 't1' });
            expect(mockInvalidateQueries).toHaveBeenCalled();
        });
    });

    describe('useTicketImageQuery', () => {
        it('should call useQuery with image queryKey', () => {
            useTicketImageQuery('r1', 't1');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['tickets', 'r1', 't1', 'image'],
                enabled: true,
                staleTime: 10 * 60 * 1000,
            }));
        });

        it('queryFn should call api.tickets().getImageUrl', async () => {
            useTicketImageQuery('r1', 't1');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.tickets().getImageUrl).toHaveBeenCalledWith('r1', 't1');
        });

        it('should disable query when ids are empty', () => {
            useTicketImageQuery('', '');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });
    });
});
