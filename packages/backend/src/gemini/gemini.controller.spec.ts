import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { GeminiExtractionException } from './exceptions/gemini.exceptions';

describe('GeminiController', () => {
  let controller: GeminiController;
  let geminiServiceMock: jest.Mocked<Partial<GeminiService>>;

  const mockFile = {
    buffer: Buffer.from('fake-image-data'),
    originalname: 'receipt.jpg',
    mimetype: 'image/jpeg',
  } as Express.Multer.File;

  const mockExtractedData = {
    total: 42.5,
    currency: 'USD',
    date: '2024-01-15',
    items: [{ name: 'Coffee', amount: 4.5 }],
  };

  beforeEach(async () => {
    geminiServiceMock = {
      extractReceipt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [{ provide: GeminiService, useValue: geminiServiceMock }],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../auth/guards/permissions.guard').PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GeminiController>(GeminiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── extractReceipt ────────────────────────────────────────────────────────────

  describe('extractReceipt', () => {
    it('should return extracted receipt data', async () => {
      (geminiServiceMock.extractReceipt as jest.Mock).mockResolvedValue(mockExtractedData);

      const result = await controller.extractReceipt(mockFile);

      expect(geminiServiceMock.extractReceipt).toHaveBeenCalledWith(
        mockFile.buffer.toString('base64'),
      );
      expect(result).toEqual(mockExtractedData);
    });

    it('should throw BadRequestException if no file is uploaded', async () => {
      await expect(controller.extractReceipt(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should propagate GeminiExtractionException if service fails', async () => {
      (geminiServiceMock.extractReceipt as jest.Mock).mockRejectedValue(
        new GeminiExtractionException(),
      );

      await expect(controller.extractReceipt(mockFile)).rejects.toThrow(GeminiExtractionException);
    });
  });
});
