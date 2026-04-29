import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutationHookOptions<TData = unknown> {
  onSuccess?: (data?: TData) => void;
  onError?: (error: unknown) => void;
}

/**
 * Factory that generates a typed mutation hook following the standard CRUD pattern.
 *
 * Eliminates the repeated boilerplate of: useMutation + invalidateQueries + onSuccess/onError
 * across all entity hooks (users, departments, organizations, roles, etc.).
 *
 * Usage:
 *   export const useCreateUserMutation = createCrudMutationHook(
 *     (data: CreateUserSchema) => api.users().create(data),
 *     [['users']],
 *   );
 */
export function createCrudMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: unknown[][],
) {
  return function useCrudMutation(options?: MutationHookOptions<TData>) {
    const queryClient = useQueryClient();

    return useMutation<TData, unknown, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    });
  };
}
