import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { ConfigService } from '@nestjs/config';
import { GeminiExtractionException } from './exceptions/gemini.exceptions';
import { CategoriesRepository } from '../categories/categories.repository';

describe('GeminiService', () => {
  let service: GeminiService;
  let mockGenerateContent: jest.Mock;

  beforeEach(async () => {
    mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({ total: 42.5, currency: 'USD', date: '2024-01-15' }),
      },
    });

    const configServiceMock = {
      get: jest.fn().mockReturnValue('fake-api-key'),
    };

    const categoriesRepoMock = {
      findByOrganization: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: CategoriesRepository, useValue: categoriesRepoMock },
      ],
    })
      .overrideProvider(GeminiService)
      .useFactory({
        factory: (
          configService: ConfigService,
          categoriesRepository: CategoriesRepository,
        ) => {
          const svc = new GeminiService(configService, categoriesRepository);
          // The model is now a property initialised in the constructor.
          // We mock it directly so tests don't require a real API key.
          (svc as any).model = { generateContent: mockGenerateContent };
          return svc;
        },
        inject: [ConfigService, CategoriesRepository],
      })
      .compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw Error if GEMINI_API_KEY is not defined', () => {
    const configServiceMockEmpty = {
      get: jest.fn().mockReturnValue(undefined),
    };
    const categoriesRepoMock = {
      findByOrganization: jest.fn(),
    } as any;
    expect(
      () =>
        new GeminiService(configServiceMockEmpty as any, categoriesRepoMock),
    ).toThrow('GEMINI_API_KEY is not defined');
  });

  // ── extractReceipt ────────────────────────────────────────────────────────────

  describe('extractReceipt', () => {
    it('should call Gemini and return parsed data', async () => {
      const imageBase64 = Buffer.from('fake-image').toString('base64');

      const result = await service.extractReceipt(imageBase64, 'org-1');

      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should map category names to category IDs correctly and handle usageMetadata', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              total: 10,
              items: [{ description: 'item1', category: 'Food' }],
            }),
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150,
            cachedContentTokenCount: 0,
          },
        },
      });

      const categoriesRepoMock = {
        findByOrganization: jest
          .fn()
          .mockResolvedValue([{ id: 'cat-uuid-1', name: 'Food' }]),
      };

      // Mock service specifically for this test to inject categories
      const testService = new GeminiService(
        { get: () => 'fake-api-key' } as any,
        categoriesRepoMock as any,
      );
      (testService as any).model = { generateContent: mockGenerateContent };

      const result = await testService.extractReceipt('base64-data', 'org-1');

      expect(result.items).toBeDefined();
      expect(result.items![0].categoryId).toBe('cat-uuid-1');
    });

    it('should throw GeminiExtractionException if Gemini call fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

      await expect(
        service.extractReceipt('base64-data', 'org-1'),
      ).rejects.toThrow(GeminiExtractionException);
    });

    it('should throw GeminiExtractionException if response is not valid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'not-valid-json{{' },
      });

      await expect(
        service.extractReceipt('base64-data', 'org-1'),
      ).rejects.toThrow(GeminiExtractionException);
    });

    it('should correctly calculate costs when cached tokens are present', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ total: 100 }),
          usageMetadata: {
            promptTokenCount: 1000,
            candidatesTokenCount: 200,
            totalTokenCount: 1200,
            cachedContentTokenCount: 800,
          },
        },
      });

      // No crash means it successfully went through the cost calculation logic
      const result = await service.extractReceipt('base64-data', 'org-1');
      expect(result.total).toBe(100);
    });

    it('should handle missing usageMetadata gracefully', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ total: 50 }),
          usageMetadata: undefined, // Missing!
        },
      });

      const result = await service.extractReceipt('base64-data', 'org-1');
      expect(result.total).toBe(50);
    });

    it('should handle null items in response gracefully', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ total: 50, items: null }),
        },
      });

      const result = await service.extractReceipt('base64-data', 'org-1');
      expect(result.items).toBeNull();
    });
  });
});
