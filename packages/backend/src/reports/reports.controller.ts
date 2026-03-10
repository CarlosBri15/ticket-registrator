import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { updateReportFieldsSchema, updateReportStatusSchema, permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.CREATE_OWN_REPORTS)
  @Post()
  create(@Req() req, @Body() createReportDto: CreateReportDto) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.reportsService.create(requester, createReportDto);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_REPORTS,
    permissions.VIEW_TEAM_REPORTS,
    permissions.VIEW_ALL_REPORTS
  )
  @Get()
  findAll(@Req() req) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.reportsService.findAllReports(requester);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_REPORTS,
    permissions.VIEW_TEAM_REPORTS,
    permissions.VIEW_ALL_REPORTS
  )
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
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
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

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_REPORTS,
    permissions.VIEW_TEAM_REPORTS,
    permissions.VIEW_ALL_REPORTS
  )
  @Get('user/:userId')
  findUserReports(@Req() req, @Param('userId') userId?: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };

    return this.reportsService.findUserReports(requester, userId ?? req.user.id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_REPORTS,
    permissions.VIEW_TEAM_REPORTS,
    permissions.VIEW_ALL_REPORTS
  )
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.reportsService.findOne(requester, id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.EDIT_OWN_REPORTS,
    permissions.APPROVE_REPORTS
  )
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };

    // status update
    if (typeof body === 'object' && body !== null && 'status' in body) {
      const parsed = updateReportStatusSchema.safeParse(body);

      if (!parsed.success) {
        throw new BadRequestException(parsed.error.format());
      }

      return this.reportsService.updateStatus(requester, id, parsed.data);
    }

    // field update
    const parsed = updateReportFieldsSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    return this.reportsService.update(requester, id, parsed.data);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.SUBMIT_OWN_REPORTS)
  @Patch(':id/submit')
  submitReport(@Req() req, @Param('id') id: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.reportsService.submitReport(requester, id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_OWN_REPORTS)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.reportsService.remove(requester, id);
  }
}
