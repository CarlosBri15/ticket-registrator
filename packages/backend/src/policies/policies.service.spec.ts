import { Test, TestingModule } from '@nestjs/testing';
import { Document } from '@langchain/core/documents';
import { PoliciesService } from './policies.service';
import { EmbeddingsService } from './embeddings.service';
import { PoliciesRepository } from './policies.repository';

jest.mock('pdf.js-extract', () => ({
  PDFExtract: jest.fn(),
}));

describe('PoliciesService', () => {
  let service: PoliciesService;
  let embeddingsService: EmbeddingsService;
  let policiesRepository: PoliciesRepository;
  let mockExtractBuffer: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        {
          provide: EmbeddingsService,
          useValue: {
            embedDocument: jest.fn(),
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

    // Directly inject mock to bypass ESM dynamic import()
    mockExtractBuffer = jest.fn();
    (service as any).pdfExtract = { extractBuffer: mockExtractBuffer };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractTextFromFile', () => {
    it('should extract text from a PDF file', async () => {
      mockExtractBuffer.mockResolvedValueOnce({
        pages: [
          // y=400 puts items in the mid-page zone — safe from the header/footer filter
          { height: 842, content: [{ str: 'parsed', height: 12, y: 400, x: 0 }, { str: 'pdf text', height: 12, y: 400, x: 50 }] }
        ]
      } as any);

      const buffer = Buffer.from('mock pdf content');
      const result = await service.extractTextFromFile(
        buffer,
        'application/pdf',
      );

      expect(mockExtractBuffer).toHaveBeenCalledWith(buffer, {});
      // Result is now Document[], check the first document's pageContent
      expect(result[0].pageContent).toContain('parsed pdf text');
      expect(result[0].metadata.startPage).toBe(1);
    });

    it('should detect and convert short bold standalone lines into H4 sub-headers', async () => {
      mockExtractBuffer.mockResolvedValueOnce({
        pages: [
          {
            height: 842,
            content: [
              // Standalone bold sub-heading
              { str: 'Travel Booking', height: 12, y: 300, x: 50, fontName: 'Arial-Bold' },
              // Paragraph body text
              { str: 'First word is bold', height: 12, y: 400, x: 50, fontName: 'Arial-Bold' },
              { str: 'but remainder is normal.', height: 12, y: 400, x: 200, fontName: 'Arial' }
            ]
          }
        ]
      } as any);

      const buffer = Buffer.from('mock pdf content');
      const result = await service.extractTextFromFile(buffer, 'application/pdf');

      expect(result[0].pageContent).toContain('#### Travel Booking');
      expect(result[0].pageContent).toContain('First word is bold but remainder is normal.');
    });


    it('should throw an error if PDF parsing fails', async () => {
      mockExtractBuffer.mockRejectedValueOnce(new Error('PDF Parse Error'));

      const buffer = Buffer.from('mock pdf content');
      await expect(
        service.extractTextFromFile(buffer, 'application/pdf'),
      ).rejects.toThrow('Failed to parse PDF document');
    });

    it('should extract text from a non-PDF file using UTF-8', async () => {
      const buffer = Buffer.from('plain text content');
      const result = await service.extractTextFromFile(buffer, 'text/plain');
      // Result is now Document[], check the first document
      expect(result[0].pageContent).toBe('plain text content');
      expect(result[0].metadata.startPage).toBe(1);
    });
  });

  describe('filterStructuralOnlyPages', () => {
    const makePage = (content: string, page = 1) =>
      new Document({ pageContent: content, metadata: { startPage: page, endPage: page } });

    it('should keep pages with sufficient body text', () => {
      const doc = makePage('# Policy\n\nThis section describes the full policy requirements in detail.');
      const result = (service as any).filterStructuralOnlyPages([doc]);
      expect(result).toHaveLength(1);
    });

    it('should drop cover pages that contain only headers', () => {
      const doc = makePage('## Template for Travel Policy\n\n# Travel Policy and Guidelines');
      const result = (service as any).filterStructuralOnlyPages([doc]);
      expect(result).toHaveLength(0);
    });

    it('should drop blank pages', () => {
      const doc = makePage('   \n\n  ');
      const result = (service as any).filterStructuralOnlyPages([doc]);
      expect(result).toHaveLength(0);
    });

    it('should drop pages with only bullet points and short text', () => {
      // Body after stripping bullets is too short
      const doc = makePage('• Item A\n• Item B\n• Item C');
      const result = (service as any).filterStructuralOnlyPages([doc]);
      expect(result).toHaveLength(0);
    });

    it('should respect the minBodyLength parameter', () => {
      const doc = makePage('# Header\n\nShort body.');
      // Default 50 chars — body is only 11 chars → dropped
      const dropped = (service as any).filterStructuralOnlyPages([doc]);
      expect(dropped).toHaveLength(0);
      // With a lower threshold it should pass
      const kept = (service as any).filterStructuralOnlyPages([doc], 5);
      expect(kept).toHaveLength(1);
    });

    it('should preserve all content pages in a multi-page document', () => {
      const coverPage = makePage('## Cover Title\n\n# Policy Name', 1);
      const contentPage1 = makePage('# Policy\n\nThis section explains the travel policy requirements for all staff.', 2);
      const contentPage2 = makePage('## Guidelines\n\nReimbursement procedures must be followed for all expenses incurred.', 3);

      const result = (service as any).filterStructuralOnlyPages([coverPage, contentPage1, contentPage2]);
      expect(result).toHaveLength(2);
      expect(result[0].metadata.startPage).toBe(2);
      expect(result[1].metadata.startPage).toBe(3);
    });
  });

  describe('chunkDocuments', () => {
    it('should split documents into chunks', async () => {
      const docs = [new Document({ pageContent: 'a'.repeat(4000), metadata: { startPage: 1, endPage: 1 } })];
      const chunks = await service.chunkDocuments(docs);
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should stitch together sentences spanning page boundaries without cutoffs', async () => {
      const page1 = new Document({
        pageContent: '# Section 1\n\nIf the business expense includes hospitality or payment for more than one staff',
        metadata: { startPage: 1, endPage: 1 },
      });
      const page2 = new Document({
        pageContent: 'member, the receipt of tax invoice should be annotated to indicate the names of the persons in attendance.',
        metadata: { startPage: 2, endPage: 2 },
      });

      const chunks = await service.chunkDocuments([page1, page2]);

      expect(chunks).toHaveLength(1);
      // Verify complete sentence without HTML comment noise or cutoffs
      expect(chunks[0].pageContent).toBe(
        'If the business expense includes hospitality or payment for more than one staff\nmember, the receipt of tax invoice should be annotated to indicate the names of the persons in attendance.'
      );
      // Verify correct page range metadata is computed and saved
      expect(chunks[0].metadata.startPage).toBe(1);
      expect(chunks[0].metadata.endPage).toBe(2);
    });

    it('should correctly isolate page metadata for multi-page documents', async () => {
      const page1 = new Document({
        pageContent: '# Section 1\n\nThis is some long content on page 1 that exceeds the structural filter minimum body length.',
        metadata: { startPage: 1, endPage: 1 },
      });
      const page2 = new Document({
        pageContent: '# Section 2\n\nThis is some other long content on page 2 that also exceeds the structural filter minimum body length.',
        metadata: { startPage: 2, endPage: 2 },
      });

      const chunks = await service.chunkDocuments([page1, page2]);

      expect(chunks).toHaveLength(2);
      expect(chunks[0].metadata.startPage).toBe(1);
      expect(chunks[0].metadata.endPage).toBe(1);
      expect(chunks[0].pageContent).toBe('This is some long content on page 1 that exceeds the structural filter minimum body length.');

      expect(chunks[1].metadata.startPage).toBe(2);
      expect(chunks[1].metadata.endPage).toBe(2);
      expect(chunks[1].pageContent).toBe('This is some other long content on page 2 that also exceeds the structural filter minimum body length.');
    });
  });

  describe('filterHeadersAndFooters', () => {
    const makeItem = (str: string, y: number) => ({ str, y, x: 50, height: 12 });

    const makePage = (items: ReturnType<typeof makeItem>[], height = 842) => ({
      height,
      content: items,
    });

    it('should remove items in the top 8% of page height (header zone)', () => {
      // height=842, header zone = y < 67.36
      const pages = [makePage([makeItem('CONFIDENTIAL', 30), makeItem('Body text', 400)])];
      const result = (service as any).filterHeadersAndFooters(pages);
      const texts = result[0].content.map((i: any) => i.str);
      expect(texts).not.toContain('CONFIDENTIAL');
      expect(texts).toContain('Body text');
    });

    it('should remove items in the bottom 8% of page height (footer zone)', () => {
      // height=842, footer zone = y > 774.64
      const pages = [makePage([makeItem('Page 1 of 5', 800), makeItem('Body text', 400)])];
      const result = (service as any).filterHeadersAndFooters(pages);
      const texts = result[0].content.map((i: any) => i.str);
      expect(texts).not.toContain('Page 1 of 5');
      expect(texts).toContain('Body text');
    });

    it('should remove text that repeats on 3+ pages (boilerplate)', () => {
      const pages = [
        makePage([makeItem('Health Service', 400), makeItem('Unique A', 300)]),
        makePage([makeItem('Health Service', 400), makeItem('Unique B', 300)]),
        makePage([makeItem('Health Service', 400), makeItem('Unique C', 300)]),
      ];
      const result = (service as any).filterHeadersAndFooters(pages);
      result.forEach((page: any) => {
        const texts = page.content.map((i: any) => i.str);
        expect(texts).not.toContain('Health Service');
      });
    });

    it('should keep text that appears on fewer than the threshold pages', () => {
      const pages = [
        makePage([makeItem('Unique A', 400)]),
        makePage([makeItem('Unique B', 400)]),
        makePage([makeItem('Unique C', 400)]),
      ];
      const result = (service as any).filterHeadersAndFooters(pages);
      expect(result[0].content[0].str).toBe('Unique A');
    });

    it('should return pages with the original shape (spread operator)', () => {
      const pages = [makePage([makeItem('Text', 400)])];
      const result = (service as any).filterHeadersAndFooters(pages);
      expect(result[0]).toHaveProperty('height', 842);
    });
  });

  describe('processAndIngestPolicy', () => {
    it('should process and ingest a policy successfully', async () => {
      const mockDocs = [
        new Document({ pageContent: 'mock extracted text', metadata: { startPage: 1, endPage: 1 } }),
      ];
      const mockChunks = [
        new Document({ pageContent: 'chunk 1', metadata: { H1: 'Header', startPage: 1, endPage: 1 } }),
        new Document({ pageContent: 'chunk 2', metadata: { startPage: 1, endPage: 1 } }),
      ];

      jest.spyOn(service, 'extractTextFromFile').mockResolvedValue(mockDocs);
      jest.spyOn(service, 'chunkDocuments').mockResolvedValue(mockChunks);
      (embeddingsService.embedDocument as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3]);
      (policiesRepository.savePolicyAndChunks as jest.Mock).mockResolvedValue({ id: 'policy-123' });

      const buffer = Buffer.from('file content');
      const result = await service.processAndIngestPolicy(
        buffer,
        'text/plain',
        'company-1',
        'Policy Name',
      );

      expect(service.extractTextFromFile).toHaveBeenCalledWith(buffer, 'text/plain');
      expect(service.chunkDocuments).toHaveBeenCalledWith(mockDocs);
      expect(embeddingsService.embedDocument).toHaveBeenCalledTimes(2);
      expect(policiesRepository.savePolicyAndChunks).toHaveBeenCalled();
      expect(result).toEqual({ policyId: 'policy-123', chunksProcessed: 2 });
    });
  });
});

