import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { permissions } from '@ticket-registrator/shared';
import { SeedService } from '../seed/seed.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class SystemRolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly seedService: SeedService,
  ) {}

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-permissions')
  seedPermissions() {
    return this.seedService.seedDefaultPermissions();
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-roles')
  seedRoles() {
    return this.seedService.seedDefaultRoles();
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-role-permissions')
  seedRolePermissions() {
    return this.seedService.seedDefaultRolePermissions();
  }

  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-all')
  seedAll() {
    return this.seedService.seedSystemAll();
  }

  @RequireAnyPermission(permissions.VIEW_ROLES, permissions.MANAGE_PERMISSIONS)
  @Get()
  findAll() {
    return this.rolesService.findAll(null);
  }
}

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('organizations/:companyId/roles')
export class CompanyRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequireAnyPermission(permissions.CREATE_ROLES)
  @Post()
  create(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.rolesService.create(companyId, dto, requester);
  }

  @RequireAnyPermission(permissions.VIEW_ROLES)
  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.rolesService.findAll(companyId);
  }

  @RequireAnyPermission(permissions.VIEW_ROLES)
  @Get(':id')
  findOne(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.rolesService.findOne(id, companyId);
  }

  @RequireAnyPermission(permissions.DELETE_ROLES)
  @Delete(':id')
  softDelete(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.softDelete(id, companyId, requester);
  }
}
