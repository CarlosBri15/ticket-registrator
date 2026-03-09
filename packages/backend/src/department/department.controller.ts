import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('organizations/:companyId/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  // POST /organizations/:companyId/departments
  @RequireAnyPermission(permissions.CREATE_DEPARTMENTS)
  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(companyId, dto);
  }

  // GET /organizations/:companyId/departments
  @RequireAnyPermission(permissions.VIEW_DEPARTMENTS)
  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.departmentService.findAllByCompany(companyId);
  }

  // GET /organizations/:companyId/departments/:id
  @RequireAnyPermission(permissions.VIEW_DEPARTMENTS)
  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.findOne(companyId, id);
  }

  // PATCH /organizations/:companyId/departments/:id
  @RequireAnyPermission(permissions.EDIT_DEPARTMENTS)
  @Patch(':id')
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(companyId, id, dto);
  }

  // DELETE /organizations/:companyId/departments/:id
  @RequireAnyPermission(permissions.DELETE_DEPARTMENTS)
  @Delete(':id')
  softDelete(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.softDelete(companyId, id);
  }
}
