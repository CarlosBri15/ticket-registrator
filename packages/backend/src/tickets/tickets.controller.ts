import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { updateTicketFieldsSchema, updateTicketStatusSchema, updateTicketLlmSchema } from '@ticket-registrator/shared';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('reports/:reportId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
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
      @Body() body: unknown,
    ) {
      // Status update
      if (typeof body === 'object' && body !== null && 'status' in body) {
        const parsed = updateTicketStatusSchema.safeParse(body);
        if (!parsed.success) {
          throw new BadRequestException(parsed.error.format());
        }
        return this.ticketsService.updateStatus(reportId, ticketId, parsed.data);
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
      return this.ticketsService.update(
        req.user.userId,
        reportId,
        ticketId,
        parsed.data,
      );
    }


  @Delete(':ticketId')
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
