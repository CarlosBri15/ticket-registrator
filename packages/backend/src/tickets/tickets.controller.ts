import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket-user.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import type { UpdateTicketUnionDto } from './dto/update-ticket-user.dto';
import { isStatusDto } from './dto/update-ticket-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':reportId')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req,
    @Param('reportId') reportId: string,
    //@Body() dto: CreateTicketDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ticketsService.create(
      req.user.userId,
      reportId,
      //dto,
      file,
    );
  }

  @Get('report/:reportId')
  findAll(@Req() req, @Param('reportId') reportId: string) {
    return this.ticketsService.findAll(req.user.userId, reportId);
  }

   @Patch(':ticketId/report/:reportId')
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

  @Delete(':ticketId/report/:reportId')
  remove(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketsService.remove(req.user.userId, reportId, ticketId);
  }

  @Get(':ticketId/report/:reportId/image')
  getImage(
    @Req() req,
    @Param('reportId') reportId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketsService.getTicketImageUrl(req.user.userId, reportId, ticketId);
  }

}
