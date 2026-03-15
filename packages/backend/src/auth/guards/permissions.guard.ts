import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionType } from '@ticket-registrator/shared';
import { RolesService } from '../../roles/roles.service';
import type { UserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: UserPayload }>();
    const { user } = request;

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    if (!user?.roleId) {
      throw new ForbiddenException('User lacks necessary role information');
    }

    // Resolve permissions from RolesService for the user role
    const userPermissions = await this.rolesService.getPermissionsForRoleId(
      user.roleId,
      user.companyId,
    );

    // Attach permissions to user object for controllers to use if needed
    user.permissions = userPermissions as PermissionType[];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Requires one of: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
