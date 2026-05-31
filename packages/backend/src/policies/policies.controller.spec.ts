import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';

jest.mock('pdf.js-extract', () => ({
  PDFExtract: jest.fn().mockImplementation(() => ({
    extractBuffer: jest.fn(),
  })),
}));
import { BadRequestException } from '@nestjs/common';
import { IngestPolicyDto } from './dto/ingest-document.dto';

describe('PoliciesController', () => {
  let controller: PoliciesController;
  let service: PoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliciesController],
      providers: [
        {
          provide: PoliciesService,
          useValue: {
            processAndIngestPolicy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PoliciesController>(PoliciesController);
    service = module.get<PoliciesService>(PoliciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingestPolicy', () => {
    const mockFile = {
      buffer: Buffer.from('test document content'),
      mimetype: 'application/pdf',
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      size: 100,
    } as Express.Multer.File;

    const mockDto: IngestPolicyDto = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Policy',
    };

    it('should throw BadRequestException if file is not provided', async () => {
      await expect(
        controller.ingestPolicy(undefined as any, mockDto),
      ).rejects.toThrow(
        new BadRequestException(
          'No file uploaded. Please upload a file using the "file" form-data field.',
        ),
      );
    });

    it('should call processAndIngestPolicy and return success result', async () => {
      const mockResult = { policyId: 'policy-1', chunksProcessed: 5 };
      jest
        .spyOn(service, 'processAndIngestPolicy')
        .mockResolvedValue(mockResult);

      const result = await controller.ingestPolicy(mockFile, mockDto);

      expect(service.processAndIngestPolicy).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.mimetype,
        mockDto.companyId,
        mockDto.name,
      );
      expect(result).toEqual({
        message: 'Successfully ingested policy document',
        ...mockResult,
      });
    });
  });
});
