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
  ParseUUIDPipe,
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
  UpdateItemStatusDto,
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
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: string,
  ) {
    return this.ticketsService.create(requester, reportId, file, language);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get()
  findAll(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
  ) {
    return this.ticketsService.findAll(requester, reportId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get(':ticketId')
  findOne(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) id: string,
  ) {
    return this.ticketsService.findOne(requester, reportId, id);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.EDIT_TICKETS)
  @Patch(':ticketId')
  update(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateTicketFieldsDto,
  ) {
    return this.ticketsService.update(requester, reportId, ticketId, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.APPROVE_TICKETS)
  @Patch(':ticketId/status')
  updateStatus(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(requester, reportId, ticketId, dto);
  }

  /**
   * Per-item supervisor review endpoint. Updates a single item's status
   * without touching siblings — used by the ticket detail modal's per-item
   * approve/reject buttons.
   */
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.APPROVE_REPORTS)
  @Patch(':ticketId/items/:itemId/status')
  updateItemStatus(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.ticketsService.updateItemStatus(
      requester,
      reportId,
      ticketId,
      itemId,
      dto,
    );
  }

  /**
   * Bulk per-ticket review endpoint. Sets every item to the same status in a
   * single transaction. Backs the "Approve all" / "Reject all" shortcut.
   * Route is more specific than `:ticketId` but less than `:ticketId/items/:itemId/status`,
   * so the order in the controller doesn't matter here — Nest resolves by literal.
   */
  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.APPROVE_REPORTS)
  @Patch(':ticketId/items/status')
  updateAllItemsStatus(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.ticketsService.updateAllItemsStatus(
      requester,
      reportId,
      ticketId,
      dto,
    );
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_TICKETS)
  @Delete(':ticketId')
  remove(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ) {
    return this.ticketsService.remove(requester, reportId, ticketId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.DELETE_TICKETS)
  @Delete(':ticketId/hard')
  hardDelete(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ) {
    return this.ticketsService.hardDelete(requester, reportId, ticketId);
  }

  @UseGuards(PermissionsGuard)
  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get(':ticketId/image')
  getImage(
    @CurrentUser() requester: UserPayload,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ) {
    return this.ticketsService.getTicketImageUrl(requester, reportId, ticketId);
  }
}
