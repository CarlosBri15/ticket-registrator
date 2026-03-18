import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/clientContainer';
import { AssignPermission } from '../schemas/permissions/assignPermission.schema';

/** All permissions in the system catalog */
export const useAllPermissionsQuery = () => {
    return useQuery({
        queryKey: ['permissions', 'catalog'],
        queryFn: () => api.permissions().getAll(),
        staleTime: 1000 * 60 * 5,
    });
};

/** Permissions assigned to a specific role */
export const useRolePermissionsQuery = (companyId?: string, roleId?: string) => {
    return useQuery({
        queryKey: ['roles', companyId, roleId, 'permissions'],
        queryFn: () => api.roles().getRolePermissions(companyId, roleId),
        enabled: !!companyId && !!roleId,
    });
};

export const useAssignPermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AssignPermission & { _companyId?: string }) =>
            api.permissions().assignToRole({
                roleId: data.roleId,
                permissionId: data.permissionId,
                companyId: data.companyId,
            }),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({
                queryKey: ['roles', vars._companyId, vars.roleId, 'permissions'],
            });
        },
    });
};

export const useUnassignPermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { roleId: string; permissionId: string; companyId?: string | null }) =>
            api.permissions().unassignFromRole(vars.roleId, vars.permissionId),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({
                queryKey: ['roles', vars.companyId, vars.roleId, 'permissions'],
            });
        },
    });
};
