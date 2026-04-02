import { ticketsApi } from './tickets';

describe('ticketsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };

    const api = ticketsApi(mockClient as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getByReport', () => {
        it('should call GET /reports/:reportId/tickets', async () => {
            const tickets = [{ id: 't1' }];
            mockClient.get.mockResolvedValue({ data: tickets });

            const result = await api.getByReport('report1');

            expect(mockClient.get).toHaveBeenCalledWith('/reports/report1/tickets');
            expect(result).toEqual(tickets);
        });
    });

    describe('get', () => {
        it('should call GET /reports/:reportId/tickets/:ticketId', async () => {
            const ticket = { id: 't1', report_id: 'r1' };
            mockClient.get.mockResolvedValue({ data: ticket });

            const result = await api.get('r1', 't1');

            expect(mockClient.get).toHaveBeenCalledWith('/reports/r1/tickets/t1');
            expect(result).toEqual(ticket);
        });
    });

    describe('upload', () => {
        it('should call POST /reports/:reportId/tickets with FormData', async () => {
            const formData = new FormData();
            const ticket = { id: 't1' };
            mockClient.post.mockResolvedValue({ data: ticket });

            const result = await api.upload('r1', formData);

            expect(mockClient.post).toHaveBeenCalledWith('/reports/r1/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toEqual(ticket);
        });
    });

    describe('update', () => {
        it('should call PATCH /reports/:reportId/tickets/:ticketId', async () => {
            const updateData = { amount: 50 };
            const ticket = { id: 't1', amount: 50 };
            mockClient.patch.mockResolvedValue({ data: ticket });

            const result = await api.update('r1', 't1', updateData);

            expect(mockClient.patch).toHaveBeenCalledWith('/reports/r1/tickets/t1', updateData);
            expect(result).toEqual(ticket);
        });
    });

    describe('delete', () => {
        it('should call DELETE /reports/:reportId/tickets/:ticketId', async () => {
            mockClient.delete.mockResolvedValue({ data: undefined });

            await api.delete('r1', 't1');

            expect(mockClient.delete).toHaveBeenCalledWith('/reports/r1/tickets/t1');
        });
    });

    describe('getImageUrl', () => {
        it('should call GET /reports/:reportId/tickets/:ticketId/image', async () => {
            const urlResponse = { url: 'https://storage.example.com/image.jpg' };
            mockClient.get.mockResolvedValue({ data: urlResponse });

            const result = await api.getImageUrl('r1', 't1');

            expect(mockClient.get).toHaveBeenCalledWith('/reports/r1/tickets/t1/image');
            expect(result).toEqual(urlResponse);
        });
    });
});
