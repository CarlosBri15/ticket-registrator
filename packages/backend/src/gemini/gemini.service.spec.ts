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
          (svc as any).genAI = {
            getGenerativeModel: () => ({
              generateContent: mockGenerateContent,
            }),
          };
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

  // ── extractReceipt ────────────────────────────────────────────────────────────

  describe('extractReceipt', () => {
    it('should call Gemini and return parsed data', async () => {
      const imageBase64 = Buffer.from('fake-image').toString('base64');

      const result = await service.extractReceipt(imageBase64, 'org-1');

      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result).toBeDefined();
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
  });
});
