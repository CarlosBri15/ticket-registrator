import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { GoogleGenerativeAI, TaskType, Schema, SchemaType, type GenerationConfig, } from '@google/generative-ai';

import * as schema from '../db/schema';
import { DB_CONNECTION } from '../db/db.module';
import { QUERY_SYSTEM_INSTRUCTION, getQueryPrompt } from './prompts/query.prompt';
import { receiptSchema } from 'src/gemini/prompts';

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly embeddingModel;

  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    });
  }

  // 1. Serialize Ticket
  async serializeTicketForLLM(ticketId: string): Promise<string> {
    const ticketRow = await this.db.query.tickets.findFirst({
      where: eq(schema.tickets.id, ticketId),
      with: {
        items: {
          with: {
            category: true,
          },
        },
      },
    });

    if (!ticketRow) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const semanticTicket = {
      paymentType: ticketRow.paymentType,
      date: ticketRow.date,
      locationName: ticketRow.locationName,
      locationAddress: ticketRow.locationAddress,
      amount: ticketRow.amount,
      currency: ticketRow.currency,
      flag: ticketRow.flag,
      llmComment: ticketRow.llmComment,
      items: ticketRow.items?.map((item) => ({
        name: item.name,
        amount: item.amount,
        currency: item.currency,
        category: item.category ? {
          name: item.category.name,
          description: item.category.description,
        } : null,
      })) || [],
    };

    return JSON.stringify(semanticTicket, null, 2);
  }

  // 2. Generate Queries
  async generateSearchQueries(ticketJson: string): Promise<string[]> {
    this.logger.log('Generating search queries for ticket...');
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: QUERY_SYSTEM_INSTRUCTION,
    });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        search_queries: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'Between 1 and 4 distinct declarative search queries or keyword clusters based on the ticket items. Only generate as many queries as there are distinct types of expenses or potential edge cases. Do not ask questions.',
        },
      },
      required: ['search_queries'],
    };

    const prompt = getQueryPrompt(ticketJson);

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0,
          thinkingConfig: { thinkingBudget: 128 },
        } as unknown as GenerationConfig,
      });

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      const queries = parsed.search_queries || [];

      // Enforce the cap just in case the LLM disobeys the instruction
      return queries.slice(0, 4);
    } catch (error) {
      this.logger.error('Failed to generate search queries', error);
      throw new Error('Failed to generate search queries');
    }
  }

  // 3. Embed Query
  async embedQuery(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent({
      content: { role: 'user', parts: [{ text }] },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: 768,
    });
    return result.embedding.values;
  }

  // 4. Hybrid Search
  async executeHybridSearch(queries: string[]): Promise<any[]> {
    this.logger.log(`Executing Hybrid Search for ${queries.length} queries...`);

    // We will aggregate all unique chunks here
    const uniqueChunksMap = new Map<string, any>();

    for (const query of queries) {
      const embeddingVector = await this.embedQuery(query);
      const vectorString = JSON.stringify(embeddingVector);

      const cleanedQuestion = query.replace(/[^\\w\\s]/gi, '').trim();
      const textQuery = cleanedQuestion.split(/\\s+/).filter(w => w.length > 0).join(' | ');

      const result = await this.db.execute(sql`
        WITH vector_search AS (
          SELECT id, content, metadata,
            RANK () OVER (ORDER BY embedding <=> ${vectorString}::vector) AS rank
          FROM policy_chunks
          ORDER BY embedding <=> ${vectorString}::vector
          LIMIT 5
        ),
        keyword_search AS (
          SELECT id, content, metadata,
            RANK () OVER (ORDER BY ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', ${textQuery})) DESC) as rank
          FROM policy_chunks
          WHERE to_tsvector('simple', content) @@ to_tsquery('simple', ${textQuery})
          ORDER BY ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', ${textQuery})) DESC
          LIMIT 5
        )
        SELECT
          COALESCE(vector_search.id, keyword_search.id) AS id,
          COALESCE(vector_search.content, keyword_search.content) AS content,
          COALESCE(vector_search.metadata, keyword_search.metadata) AS metadata,
          (
              (0.6 * COALESCE(1.0 / (60 + vector_search.rank), 0.0)) +
              (0.4 * COALESCE(1.0 / (60 + keyword_search.rank), 0.0))
          ) AS rrf_score
        FROM vector_search
        FULL OUTER JOIN keyword_search ON vector_search.id = keyword_search.id
        ORDER BY rrf_score DESC
        LIMIT 3
      `);

      const rows = Array.isArray(result) ? result : (result as any).rows || [];

      for (const row of rows) {
        const id = row.id as string;
        if (!uniqueChunksMap.has(id)) {
          uniqueChunksMap.set(id, row);
        } else {
          const existing = uniqueChunksMap.get(id);
          if ((row.rrf_score as number) > (existing.rrf_score as number)) {
            uniqueChunksMap.set(id, row);
          }
        }
      }
    }

    // Convert map back to array, sort by best rrf_score, and keep the top 4 overall
    return Array.from(uniqueChunksMap.values())
      .sort((a, b) => (b.rrf_score as number) - (a.rrf_score as number))
      .slice(0, 4);
  }

  // 5. Orchestration
  async getRelevantPoliciesForTicket(ticketId: string) {
    this.logger.log(`Starting policy retrieval workflow for ticket: ${ticketId}`);

    // Step 1
    const ticketJson = await this.serializeTicketForLLM(ticketId);

    // Step 2
    const searchQueries = await this.generateSearchQueries(ticketJson);
    this.logger.log(`Generated ${searchQueries.length} search queries:`, searchQueries);

    if (searchQueries.length === 0) {
      return {
        ticketContext: ticketJson,
        queriesUsed: [],
        policyChunks: [],
      };
    }

    // Step 3
    const relevantChunks = await this.executeHybridSearch(searchQueries);
    this.logger.log(`Retrieved ${relevantChunks.length} unique policy chunks.`);

    // Parse metadata back to object for convenience
    const formattedChunks = relevantChunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      rrfScore: chunk.rrf_score,
      metadata: chunk.metadata ? JSON.parse(chunk.metadata as string) : null,
    }));

    return {
      ticketContext: ticketJson,
      queriesUsed: searchQueries,
      policyChunks: formattedChunks,
    };
  }
}
