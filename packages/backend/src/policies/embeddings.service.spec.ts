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

  describe('generateEmbedding', () => {
    it('should generate an embedding for text', async () => {
      const text = 'test content';
      const result = await service.generateEmbedding(text);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'text-embedding-004' });
      expect(mockEmbedContent).toHaveBeenCalledWith(text);
      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('should throw error if embedding generation fails', async () => {
      mockEmbedContent.mockRejectedValueOnce(new Error('API Error'));
      await expect(service.generateEmbedding('test content')).rejects.toThrow('Failed to generate embedding');
    });
  });
});
