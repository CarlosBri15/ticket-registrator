import { reportsApi } from './reports';

describe('reportsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };

    const api = reportsApi(mockClient as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should call GET /reports', async () => {
            const reports = [{ id: '1', name: 'Trip 1' }];
            mockClient.get.mockResolvedValue({ data: reports });

            const result = await api.getAll();

            expect(mockClient.get).toHaveBeenCalledWith('/reports');
            expect(result).toEqual(reports);
        });
    });

    describe('getOne', () => {
        it('should call GET /reports/:id', async () => {
            const report = { id: 'abc', name: 'Trip 1' };
            mockClient.get.mockResolvedValue({ data: report });

            const result = await api.getOne('abc');

            expect(mockClient.get).toHaveBeenCalledWith('/reports/abc');
            expect(result).toEqual(report);
        });
    });

    describe('create', () => {
        it('should call POST /reports with data', async () => {
            const data = { name: 'New Trip', start_date: new Date(), end_date: new Date(), currency: 'EUR' };
            const created = { id: 'new1', ...data };
            mockClient.post.mockResolvedValue({ data: created });

            const result = await api.create(data);

            expect(mockClient.post).toHaveBeenCalledWith('/reports', data);
            expect(result).toEqual(created);
        });
    });

    describe('submit', () => {
        it('should call PATCH /reports/:id/submit', async () => {
            const report = { id: 'abc', status: 'Submitted' };
            mockClient.patch.mockResolvedValue({ data: report });

            const result = await api.submit('abc');

            expect(mockClient.patch).toHaveBeenCalledWith('/reports/abc/submit');
            expect(result).toEqual(report);
        });
    });

    describe('delete', () => {
        it('should call DELETE /reports/:id', async () => {
            mockClient.delete.mockResolvedValue({ data: undefined });

            await api.delete('abc');

            expect(mockClient.delete).toHaveBeenCalledWith('/reports/abc');
        });
    });
});
