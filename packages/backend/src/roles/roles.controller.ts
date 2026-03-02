import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';

// --- SYSTEM ROLES ---
// Administered globally by Super Admin
@Controller('roles')
export class SystemRolesController {
  constructor(private readonly rolesService: RolesService) { }

  // POST /roles/system/seed-permissions
  @Post('system/seed-permissions')
  seedPermissions() {
    return this.rolesService.seedDefaultPermissions();
  }

  // POST /roles/system/seed-roles
  @Post('system/seed-roles')
  seedRoles() {
    return this.rolesService.seedDefaultRoles();
  }

  // POST /roles/system/seed-role-permissions
  @Post('system/seed-role-permissions')
  seedRolePermissions() {
    return this.rolesService.seedDefaultRolePermissions();
  }

  // Combined seeding for initial SuperAdmin system setup
  // POST /roles/system/seed-all
  @Post('system/seed-all')
  seedAll() {
    return this.rolesService.seedSystemAll();
  }

  // GET /roles - Fetch all roles in the system (For SuperAdmin)
  @Get()
  findAll() {
    return this.rolesService.findAll(null); // null means Super Admin fetching all
  }
}

// --- COMPANY ROLES ---
// Nested under organizations to restrict roles to specific companies
@Controller('organizations/:companyId/roles')
export class CompanyRolesController {
  constructor(private readonly rolesService: RolesService) { }

  // POST /organizations/:companyId/roles
  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateRoleDto,
  ) {
    // Hardcoding a requester hierarchy to 100 for now. 
    // In reality this would come from @Req() req.user.hierarchy
    const requesterHierarchy = 5;
    return this.rolesService.create(companyId, dto, requesterHierarchy);
  }

  // GET /organizations/:companyId/roles
  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.rolesService.findAll(companyId);
  }

  // GET /organizations/:companyId/roles/:id
  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.findOne(id, companyId);
  }

  // DELETE /organizations/:companyId/roles/:id
  @Delete(':id')
  softDelete(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const requesterHierarchy = 100; // Hardcoded dummy for now
    return this.rolesService.softDelete(id, companyId, requesterHierarchy);
  }
}
