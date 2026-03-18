import { Injectable } from '@nestjs/common';
import { RoleUnauthorizedException } from './exceptions/roles.exceptions';

@Injectable()
export class RolesAuthorizationService {
  validateHierarchy(requesterHierarchy: number, targetHierarchy: number) {
    if (targetHierarchy >= requesterHierarchy) {
      throw new RoleUnauthorizedException(
        'Cannot manage roles with equal or higher hierarchy than your own',
      );
    }
  }

  validateCompanyAccess(
    requesterCompanyId: string,
    roleCompanyId: string | null,
  ) {
    if (roleCompanyId && roleCompanyId !== requesterCompanyId) {
      throw new RoleUnauthorizedException(
        'You cannot access roles outside your company',
      );
    }
  }

  canManageSystemRoles(requesterPermissions: string[]): boolean {
    return requesterPermissions.includes('MANAGE_PERMISSIONS');
  }
}
