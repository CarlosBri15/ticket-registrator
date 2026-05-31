import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RetrievalService } from './retrieval.service';
import { DB_CONNECTION } from '../db/db.module';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({ search_queries: ['query 1', 'query 2'] }),
          },
        }),
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: [0.1, 0.2, 0.3] },
        }),
      }),
    })),
    TaskType: {
      RETRIEVAL_QUERY: 'RETRIEVAL_QUERY',
    },
    SchemaType: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING',
    },
  };
});

describe('RetrievalService', () => {
  let service: RetrievalService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      query: {
        tickets: {
          findFirst: jest.fn(),
        },
      },
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrievalService,
        {
          provide: DB_CONNECTION,
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<RetrievalService>(RetrievalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('serializeTicketForLLM', () => {
    it('should serialize a ticket with items and categories', async () => {
      mockDb.query.tickets.findFirst.mockResolvedValue({
        id: 'ticket-1',
        paymentType: 'CREDIT_CARD',
        amount: 100,
        currency: 'USD',
        items: [
          {
            name: 'Dinner',
            amount: 50,
            currency: 'USD',
            category: { name: 'Meals', description: 'Food and drink' },
          },
        ],
      });

      const jsonStr = await service.serializeTicketForLLM('ticket-1');
      const parsed = JSON.parse(jsonStr);

      expect(parsed.paymentType).toBe('CREDIT_CARD');
      expect(parsed.amount).toBe(100);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].category.name).toBe('Meals');
    });

    it('should throw an error if ticket is not found', async () => {
      mockDb.query.tickets.findFirst.mockResolvedValue(null);

      await expect(service.serializeTicketForLLM('non-existent')).rejects.toThrow(
        'Ticket with ID non-existent not found',
      );
    });
  });

  describe('generateSearchQueries', () => {
    it('should return up to 4 search queries from the LLM', async () => {
      const queries = await service.generateSearchQueries('{"ticket": "data"}');
      expect(queries).toEqual(['query 1', 'query 2']);
    });
  });

  describe('embedQuery', () => {
    it('should return an embedding vector', async () => {
      const vector = await service.embedQuery('test query');
      expect(vector).toEqual([0.1, 0.2, 0.3]);
    });
  });

  describe('executeHybridSearch', () => {
    it('should aggregate and deduplicate chunks by ID keeping highest RRF score', async () => {
      // Mock db.execute to return different scores for different queries
      mockDb.execute
        .mockResolvedValueOnce({
          rows: [
            { id: 'chunk-1', content: 'C1', metadata: '{"a":1}', rrf_score: 0.05 },
            { id: 'chunk-2', content: 'C2', metadata: '{"a":2}', rrf_score: 0.03 },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            { id: 'chunk-1', content: 'C1', metadata: '{"a":1}', rrf_score: 0.08 }, // Higher score
            { id: 'chunk-3', content: 'C3', metadata: '{"a":3}', rrf_score: 0.01 },
          ],
        });

      const results = await service.executeHybridSearch(['query 1', 'query 2']);

      expect(results).toHaveLength(3);
      // chunk-1 should be first with the highest score of 0.08
      expect(results[0].id).toBe('chunk-1');
      expect(results[0].rrf_score).toBe(0.08);
      
      const ids = results.map((r) => r.id);
      expect(ids).toContain('chunk-2');
      expect(ids).toContain('chunk-3');
    });
  });

  describe('getRelevantPoliciesForTicket', () => {
    it('should orchestrate the full workflow and return formatted results', async () => {
      jest.spyOn(service, 'serializeTicketForLLM').mockResolvedValue('{"ticket": 1}');
      jest.spyOn(service, 'generateSearchQueries').mockResolvedValue(['query 1']);
      jest.spyOn(service, 'executeHybridSearch').mockResolvedValue([
        { id: 'chunk-1', content: 'Text', metadata: '{"H1":"Policy"}', rrf_score: 0.1 },
      ]);

      const result = await service.getRelevantPoliciesForTicket('ticket-1');

      expect(result.ticketContext).toBe('{"ticket": 1}');
      expect(result.queriesUsed).toEqual(['query 1']);
      expect(result.policyChunks).toHaveLength(1);
      expect(result.policyChunks[0].metadata).toEqual({ H1: 'Policy' });
    });

    it('should handle zero queries returned by the LLM', async () => {
      jest.spyOn(service, 'serializeTicketForLLM').mockResolvedValue('{"ticket": 1}');
      jest.spyOn(service, 'generateSearchQueries').mockResolvedValue([]);
      
      const result = await service.getRelevantPoliciesForTicket('ticket-1');
      
      expect(result.queriesUsed).toEqual([]);
      expect(result.policyChunks).toEqual([]);
    });
  });
});
