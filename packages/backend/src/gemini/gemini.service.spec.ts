import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { ConfigService } from '@nestjs/config';
import { GeminiExtractionException } from './exceptions/gemini.exceptions';

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    })
      .overrideProvider(GeminiService)
      .useFactory({
        factory: (configService: ConfigService) => {
          const svc = new GeminiService(configService);
          (svc as any).genAI = {
            getGenerativeModel: () => ({
              generateContent: mockGenerateContent,
            }),
          };
          return svc;
        },
        inject: [ConfigService],
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

      const result = await service.extractReceipt(imageBase64);

      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw GeminiExtractionException if Gemini call fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

      await expect(service.extractReceipt('base64-data')).rejects.toThrow(
        GeminiExtractionException,
      );
    });

    it('should throw GeminiExtractionException if response is not valid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'not-valid-json{{' },
      });

      await expect(service.extractReceipt('base64-data')).rejects.toThrow(
        GeminiExtractionException,
      );
    });
  });
});
