import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  // POST /organizations  — create a new company/org
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  // GET /organizations  — list all visible orgs
  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  // GET /organizations/:id  — get one org by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  // DELETE /organizations/:id  — soft delete an org
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.organizationService.softDelete(id);
  }
}
