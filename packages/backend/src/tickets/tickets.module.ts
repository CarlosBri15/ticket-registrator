import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { StorageModule } from '../storage/storage.module';
import { TicketsRepository } from './tickets.repository';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [GeminiModule, StorageModule, ReportsModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketsRepository,
    TicketsAuthorizationService
  ],
  exports: [TicketsService, TicketsRepository],
})
export class TicketsModule { }
