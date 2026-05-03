import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { DB_CONNECTION } from '../db/db.module';

@Injectable()
export class PoliciesRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async savePolicyAndChunks(
    companyId: string,
    name: string,
    chunksWithEmbeddings: { content: string; embedding: number[]; chunkIndex: number }[],
  ) {
    return await this.db.transaction(async (tx) => {
      // 1. Insert the master policy record
      const [insertedPolicy] = await tx
        .insert(schema.policies)
        .values({
          companyId,
          name,
        })
        .returning();

      // 2. Format the chunks for batch insertion
      const chunksToInsert = chunksWithEmbeddings.map((chunk) => ({
        policyId: insertedPolicy.id,
        companyId: companyId,
        content: chunk.content,
        embedding: chunk.embedding,
        chunkIndex: chunk.chunkIndex,
      }));

      // 3. Batch insert the chunks and embeddings
      if (chunksToInsert.length > 0) {
        await tx.insert(schema.policyChunks).values(chunksToInsert);
      }

      return insertedPolicy;
    });
  }
}
