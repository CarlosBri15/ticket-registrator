import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoleType, PermissionType } from '@ticket-registrator/shared';

export interface UserPayload {
    id: string;
    role: RoleType;
    roles: string[];
    roleHierarchies: number[];
    companyId: string;
    departmentId: string;
    departmentIds: string[];
    permissions: PermissionType[];
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
