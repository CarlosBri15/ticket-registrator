import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { PoliciesRepository } from './policies.repository';
import { DbModule } from '../db/db.module';
import { EmbeddingsService } from './embeddings.service';

@Module({
  imports: [DbModule],
  controllers: [PoliciesController],
  providers: [PoliciesService, PoliciesRepository, EmbeddingsService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
