import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { GeminiService } from 'src/gemini/gemini.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Report.name, schema: ReportSchema },  // needed for updating report totals
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, GeminiService, StorageService],
})
export class TicketsModule {}
