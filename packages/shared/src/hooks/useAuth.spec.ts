jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn(), mutateAsync: jest.fn() }),
    useQuery: jest.fn().mockReturnValue({ data: null, isLoading: false }),
}));

jest.mock('../api/clientContainer', () => ({
    api: {
        auth: jest.fn().mockReturnValue({
            login: jest.fn().mockResolvedValue({ access_token: 'token' }),
            register: jest.fn().mockResolvedValue({ id: '1' }),
            getMe: jest.fn().mockResolvedValue({ id: '1', name: 'John' }),
        }),
    },
}));

import { useLoginMutation, useRegisterMutation, useUserQuery } from './useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/clientContainer';

describe('useAuth hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useLoginMutation', () => {
        it('should call useMutation with a mutationFn', () => {
            useLoginMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('should pass options to useMutation', () => {
            const options = { onSuccess: jest.fn() };
            useLoginMutation(options);
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining(options));
        });

        it('mutationFn should call api.auth().login', async () => {
            useLoginMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const credentials = { email: 'test@test.com', password: 'pass' };
            await call.mutationFn(credentials);
            expect(api.auth().login).toHaveBeenCalledWith(credentials);
        });
    });

    describe('useRegisterMutation', () => {
        it('should call useMutation with a mutationFn', () => {
            useRegisterMutation();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: expect.any(Function),
            }));
        });

        it('mutationFn should call api.auth().register', async () => {
            useRegisterMutation();
            const call = (useMutation as jest.Mock).mock.calls[0][0];
            const userData = { name: 'John', surname: 'Doe', email: 'john@test.com', username: 'johndoe', password: 'pass', confirmPassword: 'pass' };
            await call.mutationFn(userData);
            expect(api.auth().register).toHaveBeenCalledWith(userData);
        });
    });

    describe('useUserQuery', () => {
        it('should call useQuery with correct config', () => {
            useUserQuery();
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['user'],
                retry: false,
                staleTime: 1000 * 60 * 5,
            }));
        });

        it('queryFn should call api.auth().getMe', async () => {
            useUserQuery();
            const call = (useQuery as jest.Mock).mock.calls[0][0];
            await call.queryFn();
            expect(api.auth().getMe).toHaveBeenCalled();
        });
    });
});
