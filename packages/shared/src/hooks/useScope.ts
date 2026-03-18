import { useMemo } from 'react';
import { useUserQuery } from './useAuth';
import { AUTHORITY_LEVELS } from '../user-roles/roles';
import type { Scope } from '../interfaces/scope/scope.interface';

export const useScope = () => {
    const { data: user } = useUserQuery();

    const scope = useMemo<Scope>(() => {
        if (!user) return { type: 'self', userId: '', companyId: '' };

        if (!user.companyId) return { type: 'global' };

        if (user.hierarchy >= AUTHORITY_LEVELS.COMPANY) {
            return { type: 'company', companyId: user.companyId };
        }

        if (user.hierarchy >= AUTHORITY_LEVELS.DEPARTMENT) {
            if (user.departmentIds.length > 0) {
                return {
                    type: 'department',
                    companyId: user.companyId,
                    departmentIds: user.departmentIds,
                };
            }
            // Controller case: dept-level hierarchy but no specific dept → full company view
            return { type: 'company', companyId: user.companyId };
        }

        return { type: 'self', userId: user.id, companyId: user.companyId };
    }, [user]);

    return useMemo(() => ({
        scope,
        /** True only for SuperAdmin */
        isGlobal: scope.type === 'global',
        /** True for Admin, Controller and SuperAdmin */
        isCompany: scope.type === 'company' || scope.type === 'global',
        /** True for Manager */
        isDepartment: scope.type === 'department',
        /** True for Employee */
        isSelf: scope.type === 'self',
    }), [scope]);
};
