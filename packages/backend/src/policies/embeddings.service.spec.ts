import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingsService } from './embeddings.service';
import { ConfigService } from '@nestjs/config';

// Mock the GoogleGenerativeAI
const mockEmbedContent = jest.fn().mockResolvedValue({
  embedding: { values: [0.1, 0.2, 0.3] },
});
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  embedContent: mockEmbedContent,
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
    TaskType: { RETRIEVAL_DOCUMENT: 'RETRIEVAL_DOCUMENT' },
  };
});

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<EmbeddingsService>(EmbeddingsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('embedDocument', () => {
    it('should generate an embedding for text', async () => {
      const text = 'test content';
      const result = await service.embedDocument(text);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-embedding-2' });
      expect(mockEmbedContent).toHaveBeenCalledWith({
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      });
      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('should throw error if embedding generation fails', async () => {
      mockEmbedContent.mockRejectedValueOnce(new Error('API Error'));
      await expect(service.embedDocument('test content')).rejects.toThrow('Failed to generate document embedding');
    });
  });
});
