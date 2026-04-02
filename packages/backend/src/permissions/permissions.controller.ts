import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionDto,
} from './dto/permission.dto';
import {
  permissions,
  IPermission,
  IRolePermission,
} from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RequireAnyPermission(permissions.VIEW_ROLES, permissions.MANAGE_PERMISSIONS)
  @Get()
  findAll(): Promise<IPermission[]> {
    return this.permissionsService.findAll();
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post()
  create(
    @CurrentUser() requester: UserPayload,
    @Body() dto: CreatePermissionDto,
  ): Promise<IPermission> {
    return this.permissionsService.create(dto, requester);
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() requester: UserPayload,
    @Body() dto: UpdatePermissionDto,
  ): Promise<IPermission> {
    return this.permissionsService.update(id, dto, requester);
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Delete(':id')
  softDelete(@Param('id') id: string, @CurrentUser() requester: UserPayload) {
    return this.permissionsService.softDelete(id, requester);
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('seed')
  seed() {
    return this.permissionsService.seedDefaultPermissions();
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('assign-role')
  assignToRole(
    @CurrentUser() requester: UserPayload,
    @Body() dto: AssignPermissionDto,
  ): Promise<IRolePermission> {
    return this.permissionsService.assignToRole(dto, requester);
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Delete('unassign-role/role/:roleId/permission/:permissionId')
  unassignFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser() requester: UserPayload,
  ) {
    return this.permissionsService.unassignFromRole(
      roleId,
      permissionId,
      requester,
    );
  }
}
