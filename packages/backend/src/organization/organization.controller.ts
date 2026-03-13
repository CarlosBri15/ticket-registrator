import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  // POST /organizations/onboard — onboard a new company with its first admins
  @RequireAnyPermission(permissions.CREATE_COMPANY)
  @Post('onboard')
  onboard(@Body() dto: OnboardOrganizationDto) {
    return this.organizationService.onboard(dto);
  }

  // GET /organizations  — list all visible orgs
  @RequireAnyPermission(permissions.VIEW_COMPANY)
  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  // GET /organizations/:id  — get one org by ID
  @RequireAnyPermission(permissions.VIEW_COMPANY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  // PATCH /organizations/:id  — update an org
  @RequireAnyPermission(permissions.EDIT_COMPANY) // We need EDIT_COMPANY! Make sure it exists in permissions
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationService.update(id, dto);
  }

  // DELETE /organizations/:id  — soft delete an org
  @RequireAnyPermission(permissions.DELETE_COMPANY)
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.organizationService.softDelete(id);
  }
}

