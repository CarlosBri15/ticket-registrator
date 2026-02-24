import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { updateReportFieldsSchema, updateReportStatusSchema} from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Req() req, @Body() createReportDto: CreateReportDto) {
    console.log('Creating report for user:', req.user)
    return this.reportsService.create(req.user.id, createReportDto);
  }

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

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,         
      departmentId: req.user.departmentId, 
      permissions: req.user.permissions,
    }
    return this.reportsService.findOne(requester, id);
  }

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


  @Patch(':id/submit')
  submitReport(@Req() req, @Param('id') id: string) {
    return this.reportsService.submitReport(req.user.userId, id);
  } 

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.reportsService.remove(req.user.userId, id);
  }
}