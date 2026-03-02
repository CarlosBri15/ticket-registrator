import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

// Nested under organizations so departments are always scoped to a company
// e.g. POST /organizations/:companyId/departments
@Controller('organizations/:companyId/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  // POST /organizations/:companyId/departments
  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(companyId, dto);
  }

  // GET /organizations/:companyId/departments
  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.departmentService.findAllByCompany(companyId);
  }

  // GET /organizations/:companyId/departments/:id
  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.findOne(companyId, id);
  }

  // DELETE /organizations/:companyId/departments/:id
  @Delete(':id')
  softDelete(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.departmentService.softDelete(companyId, id);
  }
}
