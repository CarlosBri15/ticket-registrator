import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { GeminiService } from 'src/gemini/gemini.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [],
  controllers: [TicketsController],
  providers: [TicketsService, GeminiService, StorageService],
})
export class TicketsModule { }
