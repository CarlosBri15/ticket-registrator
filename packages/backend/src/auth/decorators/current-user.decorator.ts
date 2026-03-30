import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoleType, PermissionType } from '@ticket-registrator/shared';

export interface UserPayload {
  id: string;
  roleId: string;
  roleName: RoleType;
  roleHierarchy: number;
  companyId: string | null;
  departmentIds: string[];
  permissions: PermissionType[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: UserPayload }>();
    return request.user;
  },
);
