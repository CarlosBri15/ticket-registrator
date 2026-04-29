import { categoriesApi } from './categories';

describe('categoriesApi', () => {
    let mockClient: any;
    let api: ReturnType<typeof categoriesApi>;

    beforeEach(() => {
        mockClient = {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
        };
        api = categoriesApi(mockClient);
    });

    it('getAll should call GET /categories', async () => {
        mockClient.get.mockResolvedValue({ data: [{ id: '1' }] });
        const res = await api.getAll();
        expect(mockClient.get).toHaveBeenCalledWith('/categories');
        expect(res).toEqual([{ id: '1' }]);
    });

    it('get should call GET /categories/:id', async () => {
        mockClient.get.mockResolvedValue({ data: { id: '1' } });
        const res = await api.get('1');
        expect(mockClient.get).toHaveBeenCalledWith('/categories/1');
        expect(res).toEqual({ id: '1' });
    });

    it('create should call POST /categories', async () => {
        const data = { name: 'Food' };
        mockClient.post.mockResolvedValue({ data: { id: '1', ...data } });
        const res = await api.create(data);
        expect(mockClient.post).toHaveBeenCalledWith('/categories', data);
        expect(res).toEqual({ id: '1', ...data });
    });

    it('update should call PATCH /categories/:id', async () => {
        const data = { name: 'New Food' };
        mockClient.patch.mockResolvedValue({ data: { id: '1', ...data } });
        const res = await api.update('1', data);
        expect(mockClient.patch).toHaveBeenCalledWith('/categories/1', data);
        expect(res).toEqual({ id: '1', ...data });
    });

    it('delete should call DELETE /categories/:id', async () => {
        mockClient.delete.mockResolvedValue({ data: null });
        await api.delete('1');
        expect(mockClient.delete).toHaveBeenCalledWith('/categories/1');
    });
});
