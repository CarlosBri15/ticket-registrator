import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import {
  UpdateReportFieldsDto,
  UpdateReportStatusDto,
} from './dto/update-report.dto';
import { permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @RequireAnyPermission(permissions.CREATE_REPORTS)
  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(user, createReportDto);
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.reportsService.findAllReports(user);
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get('paginated')
  findAllPaginated(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.findAllReportsPaginated(user, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      userId,
      name,
      startDate,
      endDate,
      status,
    });
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get('user/:userId')
  findUserReports(
    @CurrentUser() user: UserPayload,
    @Param('userId', ParseUUIDPipe) userId?: string,
  ) {
    return this.reportsService.findUserReports(user, userId ?? user.id);
  }

  @RequireAnyPermission(permissions.VIEW_REPORTS)
  @Get(':id')
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.findOne(user, id);
  }

  @RequireAnyPermission(permissions.EDIT_REPORTS)
  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportFieldsDto,
  ) {
    return this.reportsService.update(user, id, dto);
  }

  @RequireAnyPermission(permissions.APPROVE_REPORTS)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(user, id, dto);
  }

  @RequireAnyPermission(permissions.SUBMIT_REPORTS)
  @Patch(':id/submit')
  submitReport(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.submitReport(user, id);
  }

  @RequireAnyPermission(permissions.DELETE_REPORTS)
  @Delete(':id')
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.remove(user, id);
  }
}
