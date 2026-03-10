import { Injectable } from '@nestjs/common';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { ROLE_HIERARCHY } from '@ticket-registrator/shared';
import { Role } from './schemas/role.schema';
import { RoleUnauthorizedException } from './exceptions/roles.exceptions';

@Injectable()
export class RolesAuthorizationService {

    validateHierarchy(requesterRole: string, targetHierarchy: number) {
        const requesterHierarchy = ROLE_HIERARCHY[requesterRole as keyof typeof ROLE_HIERARCHY] ?? 0;
        if (targetHierarchy >= requesterHierarchy) {
            throw new RoleUnauthorizedException('Cannot manage roles with equal or higher hierarchy than your own');
        }
    }

    validateCompanyAccess(requesterCompanyId: string, roleCompanyId: string | null) {
        if (roleCompanyId && roleCompanyId !== requesterCompanyId) {
            throw new RoleUnauthorizedException('You cannot access roles outside your company');
        }
    }

    canManageSystemRoles(requesterPermissions: string[]): boolean {
        // This could also check specifically for MANAGE_PERMISSIONS
        return requesterPermissions.includes('MANAGE_PERMISSIONS');
    }
}
