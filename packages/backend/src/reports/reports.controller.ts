import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { updateReportFieldsSchema, updateReportStatusSchema, permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @RequireAnyPermission(permissions.CREATE_REPORTS)
  @Post()
  create(@Req() req, @Body() createReportDto: CreateReportDto) {
    console.log('Creating report for user:', req.user)
    return this.reportsService.create(req.user.id, createReportDto);
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get()
  findAll(@Req() req) {
    const requester = {
      id: req.user.id,
      roles: req.user.roles,
      roleHierarchies: req.user.roleHierarchies,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };
    return this.reportsService.findAllReports(requester);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get('paginated')
  findAllPaginated(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const requester = {
      id: req.user.id,
      roles: req.user.roles,
      roleHierarchies: req.user.roleHierarchies,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };

    return this.reportsService.findAllReportsPaginated(requester, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      userId,
      name,
      startDate,
      endDate,
      status: status as any,
    });
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const requester = {
      id: req.user.id,
      roles: req.user.roles,
      roleHierarchies: req.user.roleHierarchies,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    }
    return this.reportsService.findOne(requester, id);
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get('user/:userId')
  findUserReports(@Req() req, @Param('userId') userId?: string) {
    const requester = {
      id: req.user.id,
      roles: req.user.roles,
      roleHierarchies: req.user.roleHierarchies,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };

    return this.reportsService.findUserReports(requester, userId ?? req.user.id);
  }


  @RequireAnyPermission(permissions.EDIT_REPORTS)
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    // status update
    if (typeof body === 'object' && body !== null && 'status' in body) {
      const parsed = updateReportStatusSchema.safeParse(body);

      if (!parsed.success) {
        throw new BadRequestException(parsed.error.format());
      }

      // parsed.data is exactly UpdateReportStatusDto shape
      return this.reportsService.updateStatus(id, parsed.data);
    }

    // field update
    const parsed = updateReportFieldsSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    // parsed.data is exactly UpdateReportFieldsDto shape
    return this.reportsService.update(
      req.user.userId,
      id,
      parsed.data,
    );
  }


  @RequireAnyPermission(permissions.SUBMIT_REPORTS)
  @Patch(':id/submit')
  submitReport(@Req() req, @Param('id') id: string) {
    return this.reportsService.submitReport(req.user.userId, id);
  }

  @RequireAnyPermission(permissions.DELETE_REPORTS)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.reportsService.remove(req.user.userId, id);
  }
}