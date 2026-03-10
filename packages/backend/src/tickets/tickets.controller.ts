import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { updateTicketFieldsSchema, updateTicketStatusSchema, updateTicketLlmSchema, permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('reports/:reportId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.CREATE_OWN_TICKETS)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req,
    @Param('reportId') reportId: string,
    //@Body() dto: CreateTicketDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.ticketsService.create(requester, reportId, file);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_TICKETS,
    permissions.VIEW_TEAM_TICKETS,
    permissions.VIEW_ALL_TICKETS
  )
  @Get()
  findAll(@Req() req, @Param('reportId') reportId: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.ticketsService.findAll(requester, reportId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_TICKETS,
    permissions.VIEW_TEAM_TICKETS,
    permissions.VIEW_ALL_TICKETS
  )
  @Get(':ticketId')
  findOne(@Req() req, @Param('reportId') reportId: string, @Param('ticketId') id: string) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.ticketsService.findOne(requester, reportId, id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.EDIT_OWN_TICKETS,
    permissions.APPROVE_TICKETS
  )
  @Patch(':ticketId')
  update(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
    @Body() body: unknown,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };

    // Status update
    if (typeof body === 'object' && body !== null && 'status' in body) {
      const parsed = updateTicketStatusSchema.safeParse(body);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.format());
      }
      return this.ticketsService.updateStatus(requester, reportId, ticketId, parsed.data);
    }

    // LLM update
    if (
      typeof body === 'object' &&
      body !== null &&
      ('llm_appproved_percentage' in body ||
      'llm_suggested_amount' in body ||
      'llm_recomendation' in body)
    ) {
      const parsed = updateTicketLlmSchema.safeParse(body);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.format());
      }
      //return this.ticketsService.updateLlm(reportId, ticketId, parsed.data);
    }

    // Fields update
    const parsed = updateTicketFieldsSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }
    return this.ticketsService.update(requester, reportId, ticketId, parsed.data);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_OWN_TICKETS)
  @Delete(':ticketId')
  remove(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.ticketsService.remove(requester, reportId, ticketId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(
    permissions.VIEW_OWN_TICKETS,
    permissions.VIEW_TEAM_TICKETS,
    permissions.VIEW_ALL_TICKETS
  )
  @Get(':ticketId/image')
  getImage(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };
    return this.ticketsService.getTicketImageUrl(requester, reportId, ticketId);
  }
}
