jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        categories: jest.fn().mockReturnValue({
            getAll: jest.fn().mockResolvedValue([]),
            get: jest.fn().mockResolvedValue({ id: '1' }),
        }),
    },
}));

import { useCategoriesQuery, useCategoryQuery } from './useCategories';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useCategories hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useCategoriesQuery', () => {
        it('should call useQuery with categories queryKey', () => {
            useCategoriesQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['categories'],
            }));
        });

        it('queryFn should call api.categories().getAll', async () => {
            useCategoriesQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.categories().getAll).toHaveBeenCalled();
        });
    });

    describe('useCategoryQuery', () => {
        it('should call useQuery with specific category queryKey', () => {
            useCategoryQuery('abc');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['categories', 'abc'],
                enabled: true,
            }));
        });

        it('should disable query when id is empty', () => {
            useCategoryQuery('');
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });

        it('queryFn should call api.categories().get with id', async () => {
            useCategoryQuery('abc');
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.categories().get).toHaveBeenCalledWith('abc');
        });
    });
});
