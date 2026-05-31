import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  integer,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { companies } from '../../organization/schema/organization.schema';

// Exported for testing coverage
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)';
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    // Sometimes postgres returns it as a string "[1,2,3]", sometimes as an array
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  },
});

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const policyChunks = pgTable(
  'policy_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    policyId: uuid('policy_id')
      .references(() => policies.id)
      .notNull(),
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding'),
    chunkIndex: integer('chunk_index'),
    metadata: text('metadata'),
  },
  (table) => ({
    // HNSW index is the standard for fast vector similarity search in pgvector
    embeddingIndex: index('embedding_idx').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
    // GIN Index for blazing fast Keyword/Full-Text search
    textSearchIndex: index('text_search_idx').using(
      'gin',
      sql`to_tsvector('simple', ${table.content})`,
    ),
    companyIndex: index('policy_company_idx').on(table.companyId),
  }),
);
