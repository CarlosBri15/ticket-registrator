import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { permissions } from '@ticket-registrator/shared';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('organizations/:companyId/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @RequireAnyPermission(permissions.CREATE_DEPARTMENTS)
  @Post()
  create(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(requester, companyId, dto);
  }

  @RequireAnyPermission(permissions.VIEW_DEPARTMENTS)
  @Get()
  findAll(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
  ) {
    return this.departmentService.findAllByCompany(requester, companyId);
  }

  @RequireAnyPermission(permissions.VIEW_DEPARTMENTS)
  @Get(':id')
  findOne(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.findOne(requester, companyId, id);
  }

  @RequireAnyPermission(permissions.EDIT_DEPARTMENTS)
  @Patch(':id')
  update(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(requester, companyId, id, dto);
  }

  @RequireAnyPermission(permissions.DELETE_DEPARTMENTS)
  @Delete(':id')
  softDelete(
    @CurrentUser() requester: UserPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.softDelete(requester, companyId, id);
  }
}
