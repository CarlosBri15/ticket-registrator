const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn().mockReturnValue({ mutate: jest.fn() }),
  useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: mockInvalidateQueries }),
}));

import { createCrudMutationHook } from './createCrudMutationHook';
import { useMutation } from '@tanstack/react-query';

describe('createCrudMutationHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockClear();
  });

  it('returns a hook that calls useMutation with the provided mutationFn', () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: '1' });
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    useHook();
    expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
      mutationFn,
    }));
  });

  it('onSuccess invalidates all provided query keys', async () => {
    const mutationFn = jest.fn().mockResolvedValue({});
    const useHook = createCrudMutationHook(mutationFn, [['entities'], ['other']]);
    useHook();
    const call = (useMutation as jest.Mock).mock.calls[0][0];
    await call.onSuccess({});
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['entities'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['other'] });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('onSuccess calls options.onSuccess with the data', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: 'abc' });
    const onSuccess = jest.fn();
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    useHook({ onSuccess });
    const call = (useMutation as jest.Mock).mock.calls[0][0];
    await call.onSuccess({ id: 'abc' });
    expect(onSuccess).toHaveBeenCalledWith({ id: 'abc' });
  });

  it('onSuccess does not throw when options.onSuccess is not provided', () => {
    const mutationFn = jest.fn().mockResolvedValue({});
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    useHook();
    const call = (useMutation as jest.Mock).mock.calls[0][0];
    expect(() => call.onSuccess({})).not.toThrow();
  });

  it('onError calls options.onError with the error', async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error('fail'));
    const onError = jest.fn();
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    useHook({ onError });
    const call = (useMutation as jest.Mock).mock.calls[0][0];
    const err = new Error('fail');
    await call.onError(err);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it('onError does not throw when options.onError is not provided', () => {
    const mutationFn = jest.fn();
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    useHook();
    const call = (useMutation as jest.Mock).mock.calls[0][0];
    expect(() => call.onError(new Error('oops'))).not.toThrow();
  });

  it('works with no options argument', () => {
    const mutationFn = jest.fn().mockResolvedValue({});
    const useHook = createCrudMutationHook(mutationFn, [['entities']]);
    expect(() => useHook()).not.toThrow();
  });
});
