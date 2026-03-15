import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { permissions } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import {
  UpdateTicketFieldsDto,
  UpdateTicketStatusDto,
} from './dto/update-ticket-user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reports/:reportId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.CREATE_TICKETS)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ticketsService.create(requester, reportId, file);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get()
  findAll(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
  ) {
    return this.ticketsService.findAll(requester, reportId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get(':ticketId')
  findOne(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @Param('ticketId') id: string,
  ) {
    return this.ticketsService.findOne(requester, reportId, id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.EDIT_TICKETS)
  @Patch(':ticketId')
  update(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketFieldsDto,
  ) {
    return this.ticketsService.update(requester, reportId, ticketId, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.APPROVE_TICKETS)
  @Patch(':ticketId/status')
  updateStatus(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(requester, reportId, ticketId, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_TICKETS)
  @Delete(':ticketId')
  remove(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketsService.remove(requester, reportId, ticketId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get(':ticketId/image')
  getImage(
    @CurrentUser() requester: UserPayload,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketsService.getTicketImageUrl(requester, reportId, ticketId);
  }
}
