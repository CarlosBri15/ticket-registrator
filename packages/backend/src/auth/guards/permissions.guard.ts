import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionType } from '@ticket-registrator/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.permissions) {
            throw new ForbiddenException('User lacks necessary permissions');
        }

        const hasPermission = requiredPermissions.some((permission) =>
            user.permissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException(`Access denied. Requires one of: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
