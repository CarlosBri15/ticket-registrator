import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket-user.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import type { UpdateTicketUnionDto } from './dto/update-ticket-user.dto';
import { isStatusDto } from './dto/update-ticket-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('reports/:reportId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Req() req, @Param('reportId') reportId: string, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(req.user.userId, reportId, dto);
  }

  @Get()
  findAll(@Req() req, @Param('reportId') reportId: string) {
    return this.ticketsService.findAll(req.user.userId, reportId);
  }

   @Patch(':ticketId')
    update(
      @Req() req,
      @Param('reportId') reportId: string,
      @Param('ticketId') ticketId: string,
      @Body() updateTicketDto: UpdateTicketUnionDto,
    ) {
      if (isStatusDto(updateTicketDto)) {
      return this.ticketsService.updateStatus(reportId, ticketId, updateTicketDto);
    } else {
      return this.ticketsService.update(req.user.userId, reportId, ticketId, updateTicketDto);
    }
    }

  @Delete(':ticketId')
  remove(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketsService.remove(req.user.userId, reportId, ticketId);
  }

}
