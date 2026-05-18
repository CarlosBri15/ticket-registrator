import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesService } from './policies.service';
import { EmbeddingsService } from './embeddings.service';
import { PoliciesRepository } from './policies.repository';
import * as pdfParse from 'pdf-parse';

jest.mock('pdf-parse', () => jest.fn());

describe('PoliciesService', () => {
  let service: PoliciesService;
  let embeddingsService: EmbeddingsService;
  let policiesRepository: PoliciesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        {
          provide: EmbeddingsService,
          useValue: {
            generateEmbedding: jest.fn(),
          },
        },
        {
          provide: PoliciesRepository,
          useValue: {
            savePolicyAndChunks: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
    embeddingsService = module.get<EmbeddingsService>(EmbeddingsService);
    policiesRepository = module.get<PoliciesRepository>(PoliciesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractTextFromFile', () => {
    it('should extract text from a PDF file', async () => {
      const mockPdfParse = pdfParse as unknown as jest.Mock;
      mockPdfParse.mockResolvedValueOnce({ text: 'parsed pdf text' });

      const buffer = Buffer.from('mock pdf content');
      const result = await service.extractTextFromFile(
        buffer,
        'application/pdf',
      );

      expect(mockPdfParse).toHaveBeenCalledWith(buffer);
      expect(result).toBe('parsed pdf text');
    });

    it('should throw an error if PDF parsing fails', async () => {
      const mockPdfParse = pdfParse as unknown as jest.Mock;
      mockPdfParse.mockRejectedValueOnce(new Error('PDF Parse Error'));

      const buffer = Buffer.from('mock pdf content');
      await expect(
        service.extractTextFromFile(buffer, 'application/pdf'),
      ).rejects.toThrow('Failed to parse PDF document');
    });

    it('should extract text from a non-PDF file using UTF-8', async () => {
      const buffer = Buffer.from('plain text content');
      const result = await service.extractTextFromFile(buffer, 'text/plain');
      expect(result).toBe('plain text content');
    });
  });

  describe('chunkText', () => {
    it('should split text into chunks', async () => {
      const text = 'a'.repeat(4000); // More than 3200 characters to trigger splitting
      const chunks = await service.chunkText(text);
      expect(chunks.length).toBeGreaterThan(1);
    });
  });

  describe('processAndIngestPolicy', () => {
    it('should process and ingest a policy successfully', async () => {
      // Mock extractTextFromFile
      jest
        .spyOn(service, 'extractTextFromFile')
        .mockResolvedValue('mock extracted text');

      // Mock chunkText
      jest
        .spyOn(service, 'chunkText')
        .mockResolvedValue(['chunk 1', 'chunk 2']);

      // Mock embeddingsService.generateEmbedding
      (embeddingsService.generateEmbedding as jest.Mock).mockResolvedValue([
        0.1, 0.2, 0.3,
      ]);

      // Mock policiesRepository.savePolicyAndChunks
      (policiesRepository.savePolicyAndChunks as jest.Mock).mockResolvedValue({
        id: 'policy-123',
      });

      const buffer = Buffer.from('file content');
      const result = await service.processAndIngestPolicy(
        buffer,
        'text/plain',
        'company-1',
        'Policy Name',
      );

      expect(service.extractTextFromFile).toHaveBeenCalledWith(
        buffer,
        'text/plain',
      );
      expect(service.chunkText).toHaveBeenCalledWith('mock extracted text');
      expect(embeddingsService.generateEmbedding).toHaveBeenCalledTimes(2);
      expect(embeddingsService.generateEmbedding).toHaveBeenCalledWith(
        'chunk 1',
      );
      expect(embeddingsService.generateEmbedding).toHaveBeenCalledWith(
        'chunk 2',
      );
      expect(policiesRepository.savePolicyAndChunks).toHaveBeenCalledWith(
        'company-1',
        'Policy Name',
        [
          { content: 'chunk 1', embedding: [0.1, 0.2, 0.3], chunkIndex: 0 },
          { content: 'chunk 2', embedding: [0.1, 0.2, 0.3], chunkIndex: 1 },
        ],
      );

      expect(result).toEqual({ policyId: 'policy-123', chunksProcessed: 2 });
    });
  });
});
