import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { StorageService } from 'src/storage/storage.service';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, StorageService],
  exports: [GeminiService],
})
export class GeminiModule {}
