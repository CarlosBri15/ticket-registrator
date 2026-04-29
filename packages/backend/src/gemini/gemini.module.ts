import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { StorageModule } from '../storage/storage.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [StorageModule, CategoriesModule],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
