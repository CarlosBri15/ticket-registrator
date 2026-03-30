import { Injectable } from '@nestjs/common';
import {
  AUTHORITY_LEVELS,
  permissions,
  PermissionType,
} from '@ticket-registrator/shared';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersAuthorizationService {
  validateCanCreateAdmin(requesterPermissions: PermissionType[]) {
    return requesterPermissions.includes(permissions.CREATE_ADMINS);
  }

  validateHierarchyAssignment(
    requesterHierarchy: number,
    targetRoleHierarchy: number,
  ) {
    return requesterHierarchy > targetRoleHierarchy;
  }

  validateDepartmentAssignment(
    requesterHierarchy: number,
    requesterDeptIds: string[],
    targetDeptIds: string[],
  ) {
    if (
      requesterHierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
      requesterHierarchy < AUTHORITY_LEVELS.COMPANY
    ) {
      return targetDeptIds.every((id) => requesterDeptIds.includes(id));
    }
    return true;
  }

  validateCanUpdateUser(
    requester: {
      id: string;
      roleHierarchy: number;
      companyId: string | null;
      permissions: PermissionType[];
    },
    targetUser: User & { role: { hierarchy: number } | null },
  ) {
    const isSelfUpdate = requester.id === targetUser.id;

    if (isSelfUpdate) {
      return requester.permissions.includes(permissions.EDIT_USERS);
    }

    if (requester.roleHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
      return false;
    }

    if (
      targetUser.companyId !== requester.companyId &&
      requester.roleHierarchy < AUTHORITY_LEVELS.GLOBAL
    ) {
      return false;
    }

    if (
      requester.roleHierarchy >= AUTHORITY_LEVELS.COMPANY &&
      (targetUser.role?.hierarchy ?? 0) >= requester.roleHierarchy
    ) {
      return false;
    }

    return true;
  }

  validateCanDeleteUser(
    requesterHierarchy: number,
    targetUserHierarchy: number,
  ) {
    return requesterHierarchy > targetUserHierarchy;
  }
}
