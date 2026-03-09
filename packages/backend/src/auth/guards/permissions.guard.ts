import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionType } from '@ticket-registrator/shared';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private rolesService: RolesService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user || !user.roles || user.roles.length === 0) {
            throw new ForbiddenException('User lacks necessary role information');
        }

        // Resolve permissions from RolesService for all user roles
        const userPermissions = await this.rolesService.getPermissionsForRoles(user.roles, user.companyId);

        // Attach permissions to user object for controllers to use if needed
        user.permissions = userPermissions;

        const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const hasPermission = requiredPermissions.some((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException(`Access denied. Requires one of: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
