import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { UpdateReportUnionDto} from './dto/update-report.dto';
import { isStatusDto } from './dto/update-report.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Req() req, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, createReportDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.reportsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.reportsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportUnionDto,
  ) {
    if (isStatusDto(updateReportDto)) {
    return this.reportsService.updateStatus(id, updateReportDto);
  } else {
    return this.reportsService.update(req.user.userId, id, updateReportDto);
  }
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