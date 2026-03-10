import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';

// --- SYSTEM ROLES ---
// Administered globally by Super Admin
@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class SystemRolesController {
  constructor(private readonly rolesService: RolesService) { }

  // POST /roles/system/seed-permissions
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-permissions')
  seedPermissions() {
    return this.rolesService.seedDefaultPermissions();
  }

  // POST /roles/system/seed-roles
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-roles')
  seedRoles() {
    return this.rolesService.seedDefaultRoles();
  }

  // POST /roles/system/seed-role-permissions
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-role-permissions')
  seedRolePermissions() {
    return this.rolesService.seedDefaultRolePermissions();
  }

  // Combined seeding for initial SuperAdmin system setup
  // POST /roles/system/seed-all
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.MANAGE_PERMISSIONS)
  @Post('system/seed-all')
  seedAll() {
    return this.rolesService.seedSystemAll();
  }

  // GET /roles - Fetch all roles in the system (For SuperAdmin)
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_ROLES, permissions.MANAGE_PERMISSIONS)
  @Get()
  findAll() {
    return this.rolesService.findAll(null);
  }
}

// --- COMPANY ROLES ---
// Nested under organizations to restrict roles to specific companies
@UseGuards(AuthGuard('jwt'))
@Controller('organizations/:companyId/roles')
export class CompanyRolesController {
  constructor(private readonly rolesService: RolesService) { }

  // POST /organizations/:companyId/roles
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.CREATE_ROLES)
  @Post()
  create(
    @Req() req,
    @Param('companyId') companyId: string,
    @Body() dto: CreateRoleDto,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.rolesService.create(companyId, dto, requester);
  }

  // GET /organizations/:companyId/roles
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_ROLES)
  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.rolesService.findAll(companyId);
  }

  // GET /organizations/:companyId/roles/:id
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_ROLES)
  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.findOne(id, companyId);
  }

  // DELETE /organizations/:companyId/roles/:id
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_ROLES)
  @Delete(':id')
  softDelete(
    @Req() req,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.rolesService.softDelete(id, companyId, requester);
  }
}
