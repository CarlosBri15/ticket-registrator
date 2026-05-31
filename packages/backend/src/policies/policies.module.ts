import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { PoliciesRepository } from './policies.repository';
import { DbModule } from '../db/db.module';
import { EmbeddingsService } from './embeddings.service';
import { RetrievalService } from './retrieval.service';

@Module({
  imports: [DbModule],
  controllers: [PoliciesController],
  providers: [PoliciesService, PoliciesRepository, EmbeddingsService, RetrievalService],
  exports: [PoliciesService, RetrievalService],
})
export class PoliciesModule {}
