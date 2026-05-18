import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { ReportsRepository } from '../reports/reports.repository';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { GeminiService } from '../gemini/gemini.service';
import { StorageService } from '../storage/storage.service';
import {
  TicketStatus,
  ReportStatus,
  TicketLifecycle,
  ItemStatus,
} from '@ticket-registrator/shared';
import {
  TicketUnauthorizedException,
  TicketNotFoundException,
  TicketStatusConflictException,
} from './exceptions/tickets.exceptions';
import { ReportNotFoundException } from '../reports/exceptions/reports.exceptions';
import { CryptoService } from '../crypto/crypto.service';

const sharpMock = {
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed-webp-data')),
};

jest.mock('sharp', () => jest.fn(() => sharpMock));

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepositoryMock: any;
  let reportsRepositoryMock: any;
  let ticketsAuthMock: any;
  let geminiServiceMock: any;
  let storageServiceMock: any;
  let cryptoServiceMock: any;

  const requester = { id: 'user-1', companyId: 'org-1' } as any;

  beforeEach(async () => {
    ticketsRepositoryMock = {
      findById: jest.fn(),
      findByReportId: jest.fn(),
      findAllFingerprints: jest.fn().mockResolvedValue([]),
      findSemanticDuplicate: jest.fn(),
      create: jest.fn(),
      updateWithHistory: jest.fn(),
      softDelete: jest.fn(),
      hardDelete: jest.fn(),
    };
    reportsRepositoryMock = {
      findById: jest.fn(),
    };
    ticketsAuthMock = {
      validateCanViewReport: jest.fn(),
      validateCanModifyReport: jest.fn(),
    };
    geminiServiceMock = {
      extractReceipt: jest.fn(),
    };
    storageServiceMock = {
      uploadFile: jest.fn(),
      findFile: jest.fn(),
      removeFile: jest.fn(),
    };
    cryptoServiceMock = {
      hashPassword: jest.fn(),
      generatePerceptualHash: jest.fn(),
      calculateHammingDistance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: TicketsRepository, useValue: ticketsRepositoryMock },
        { provide: ReportsRepository, useValue: reportsRepositoryMock },
        { provide: TicketsAuthorizationService, useValue: ticketsAuthMock },
        { provide: GeminiService, useValue: geminiServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CryptoService, useValue: cryptoServiceMock },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  const mockReport = {
    id: 'report-1',
    userId: 'user-1',
    status: ReportStatus.CREATED,
    deletedAt: null,
    currency: 'EUR',
    startDate: new Date('2021-01-01'),
    endDate: new Date('2021-01-31'),
  };
  const mockTicket = {
    id: 'ticket-1',
    reportId: 'report-1',
    userId: 'user-1',
    status: TicketStatus.PENDING,
    lifecycle: TicketLifecycle.DRAFT,
    version: 1,
  };

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(
        requester,
        'report-1',
        {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
        } as any,
        'es',
      );

      expect(geminiServiceMock.extractReceipt).toHaveBeenCalledWith(
        expect.any(String),
        requester.companyId,
        'image/jpeg',
        'es',
      );
      expect(result.id).toBe('ticket-1');
      const sharp = require('sharp');
      expect(sharp).toHaveBeenCalled();
      expect(sharpMock.resize).toHaveBeenCalledWith({
        width: 1000,
        withoutEnlargement: true,
      });
      expect(storageServiceMock.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: Buffer.from('compressed-webp-data'),
          mimetype: 'image/webp',
          originalname: 'test.webp',
        }),
      );
    });

    it('should flag ticket as out of range if date does not match report timeframe', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
        date: '2021-02-01', // Outside range [2021-01-01, 2021-01-31]
        establishment: 'Test Store',
        address: {
          formatted_address: 'Main 1',
        },
        flag: false,
        llm_comment: null,
      });
      storageServiceMock.uploadFile.mockResolvedValue('link');

      ticketsRepositoryMock.create.mockResolvedValue({ id: 'ticket-1' });
      ticketsRepositoryMock.findById.mockResolvedValue({
        id: 'ticket-1',
        reportId: 'report-1',
        flag: true,
        llmComment:
          'Receipt date (2021-02-01) is outside report range (2021-01-01 to 2021-01-31).',
      });

      const result = await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);

      expect(result.flag).toBe(true);
      expect(result.llm_comment).toContain('outside report range');
    });

    it('should create a ticket from a PDF file without sharp processing', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      geminiServiceMock.extractReceipt.mockResolvedValue({
        establishment: 'PDF Store',
        total: 50,
        date: '2026-03-21',
        items: [],
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(
        requester,
        'report-1',
        {
          buffer: Buffer.from('pdf-data'),
          originalname: 'invoice.pdf',
          mimetype: 'application/pdf',
        } as any,
        'es',
      );

      expect(result.id).toBe('ticket-1');
      expect(sharpMock.resize).not.toHaveBeenCalled();
      expect(geminiServiceMock.extractReceipt).toHaveBeenCalledWith(
        expect.any(String),
        requester.companyId,
        'application/pdf',
        'es',
      );
      expect(storageServiceMock.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: Buffer.from('pdf-data'),
          mimetype: 'application/pdf',
          originalname: 'invoice.pdf',
        }),
      );
    });

    it('should throw DuplicateTicketException when a semantic duplicate is found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
        date: '2021-01-01',
        establishment: 'Test Store',
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.findSemanticDuplicate.mockResolvedValue(mockTicket);

      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
        } as any),
      ).rejects.toThrow(
        'This receipt has already been processed based on its extracted data.',
      );
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
        } as any),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw ReportNotFoundException when report is not visible', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({
        ...mockReport,
        deletedAt: new Date(),
      });
      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
        } as any),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
        } as any),
      ).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not in CREATED status', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.SUBMITTED,
      });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
        } as any),
      ).rejects.toThrow(TicketStatusConflictException);
    });

    it('should parse gemini date correctly', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        date: '2024-01-15',
        payment_method: 'CARD',
        items: [{ description: 'Coffee', price: 5, expense_type: 'MEALS' }],
        total: 5,
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);
      expect(result.id).toBe('ticket-1');
    });

    it('should handle invalid date from gemini (0000-00-00)', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        date: '0000-00-00',
        total: 0,
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);
      expect(result.id).toBe('ticket-1');
    });

    it('should throw DuplicateTicketException when an exact match is found (new format)', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('newhash|1.0');
      ticketsRepositoryMock.findAllFingerprints.mockResolvedValue([
        { imageId: 'oldhash|1.01' },
      ]);
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
      });
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(0); // exact match

      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
        } as any),
      ).rejects.toThrow(
        'This receipt has already been processed (Similarity match)',
      );
    });

    it('should throw DuplicateTicketException when an exact match is found (legacy)', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('newhash');
      ticketsRepositoryMock.findAllFingerprints.mockResolvedValue([
        { imageId: 'newhash' },
      ]);
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(0); // distance <= 2
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
      });

      await expect(
        service.create(requester, 'report-1', {
          buffer: Buffer.from('f'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
        } as any),
      ).rejects.toThrow(
        'This receipt has already been processed (Exact match)',
      );
    });

    it('should NOT throw DuplicateTicketException if ratio is too different', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('newhash|1.0');
      ticketsRepositoryMock.findAllFingerprints.mockResolvedValue([
        { imageId: 'oldhash|1.5' },
      ]);
      // Should not call hamming distance because ratio diff > 0.05

      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
      });
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);

      expect(ticketsRepositoryMock.create).toHaveBeenCalled();
    });

    it('should skip fingerprint entries with null imageId', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      ticketsRepositoryMock.findAllFingerprints.mockResolvedValue([
        { imageId: null },
        { imageId: 'other|1.0' },
      ]);
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);

      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [],
        total: 10,
      });
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);

      expect(ticketsRepositoryMock.create).toHaveBeenCalled();
    });

    it('should handle undefined gemini items and missing fields', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        total: 10,
        // items missing
      });
      cryptoServiceMock.generatePerceptualHash.mockResolvedValue('hash|1.0');
      cryptoServiceMock.calculateHammingDistance.mockReturnValue(100);
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', {
        buffer: Buffer.from('f'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as any);
      expect(result.id).toBe('ticket-1');
      expect(ticketsRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 10 }),
        [],
      );
    });
  });

  describe('findOne', () => {
    it('should return ticket if authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.findOne(requester, 'report-1', 'ticket-1');
      expect(result.id).toBe('ticket-1');
    });

    it('should throw TicketUnauthorizedException if NOT authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(false);

      await expect(
        service.findOne(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.findOne(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketNotFoundException when ticket not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.findOne(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketNotFoundException);
    });

    it('should throw TicketNotFoundException when ticket reportId doesnt match', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue({
        ...mockTicket,
        reportId: 'other',
      });
      await expect(
        service.findOne(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('update', () => {
    it('should update ticket fields and save history', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', {
        payment_type: 'CASH',
      });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should throw ReportNotFoundException when report not found for update', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.update(requester, 'report-1', 'ticket-1', {}),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(
        service.update(requester, 'report-1', 'ticket-1', {}),
      ).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not CREATED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.SUBMITTED,
      });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(
        service.update(requester, 'report-1', 'ticket-1', {}),
      ).rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found for update', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.update(requester, 'report-1', 'ticket-1', {}),
      ).rejects.toThrow(TicketNotFoundException);
    });

    it('should return findOne result when no changes provided', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.update(
        requester,
        'report-1',
        'ticket-1',
        {},
      );
      expect(ticketsRepositoryMock.updateWithHistory).not.toHaveBeenCalled();
    });

    it('should update with date field', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', {
        date: new Date('2024-01-15'),
      });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should update with null date', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', {
        date: null as any,
      });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should update with items', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', {
        items: [{ name: 'Coffee', amount: 5, currency: 'EUR' }],
      });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalledWith(
        'ticket-1',
        expect.any(Object),
        expect.any(Object),
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Coffee',
            status: ItemStatus.PENDING,
          }),
        ]),
      );
    });

    it('should throw TicketNotFoundException when ticket reportId mismatch', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue({
        ...mockTicket,
        reportId: 'other-report',
      });
      await expect(
        service.update(requester, 'report-1', 'ticket-1', {
          payment_type: 'CASH',
        }),
      ).rejects.toThrow(TicketNotFoundException);
    });

    it('should update multiple fields and trigger meaningful change', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', {
        location_name: 'New Shop',
        amount: 20,
        currency: 'USD',
        location_address: '123 St',
        payment_type: 'CARD',
      });

      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalledWith(
        'ticket-1',
        expect.objectContaining({
          locationName: 'New Shop',
          amount: 20,
          currency: 'USD',
          lifecycle: TicketLifecycle.SUBMITTED,
          status: TicketStatus.PENDING,
          version: 2,
        }),
        expect.any(Object),
        undefined,
      );
    });

    it('should update non-meaningful fields without changing status', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      const ticketInReview = {
        ...mockTicket,
        status: TicketStatus.APPROVED,
        lifecycle: TicketLifecycle.SUBMITTED,
      };
      ticketsRepositoryMock.findById.mockResolvedValue(ticketInReview);

      await service.update(requester, 'report-1', 'ticket-1', {
        cgs_bucket_link_justification: 'needed high res',
        last_four_digits: '5555',
      });

      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalledWith(
        'ticket-1',
        expect.objectContaining({
          cgsBucketLinkJustification: 'needed high res',
          lastFourDigits: '5555',
        }),
        expect.any(Object),
        undefined,
      );

      // Ensure it DID NOT overwrite status/lifecycle
      const updateObject =
        ticketsRepositoryMock.updateWithHistory.mock.calls[0][1];
      expect(updateObject.status).toBeUndefined();
      expect(updateObject.lifecycle).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update status if report is SUBMITTED', async () => {
      const submittedReport = { ...mockReport, status: ReportStatus.SUBMITTED };
      reportsRepositoryMock.findById.mockResolvedValue(submittedReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.updateStatus(requester, 'report-1', 'ticket-1', {
        status: TicketStatus.APPROVED,
        approved_amount: 10,
      });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.updateStatus(requester, 'report-1', 'ticket-1', {
          status: TicketStatus.APPROVED,
          approved_amount: 0,
        }),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketStatusConflictException when report not SUBMITTED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport); // CREATED status
      await expect(
        service.updateStatus(requester, 'report-1', 'ticket-1', {
          status: TicketStatus.APPROVED,
          approved_amount: 0,
        }),
      ).rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found', async () => {
      const submittedReport = { ...mockReport, status: ReportStatus.SUBMITTED };
      reportsRepositoryMock.findById.mockResolvedValue(submittedReport);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.updateStatus(requester, 'report-1', 'ticket-1', {
          status: TicketStatus.APPROVED,
          approved_amount: 0,
        }),
      ).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete ticket', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      await service.remove(requester, 'report-1', 'ticket-1');
      expect(ticketsRepositoryMock.softDelete).toHaveBeenCalled();
    });

    it('should throw ReportNotFoundException when report not found for remove', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.remove(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(
        service.remove(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not CREATED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.SUBMITTED,
      });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(
        service.remove(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found for remove', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.remove(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete ticket and remove GCS file', async () => {
      const ticketWithImage = {
        ...mockTicket,
        items: [],
        cgsBucketLink: 'test-image.webp',
      };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketWithImage);

      await service.hardDelete(requester, 'report-1', 'ticket-1');

      expect(storageServiceMock.removeFile).toHaveBeenCalledWith(
        'test-image.webp',
      );
      expect(ticketsRepositoryMock.hardDelete).toHaveBeenCalledWith('ticket-1');
    });

    it('should hard delete ticket even if GCS file removal fails', async () => {
      const ticketWithImage = {
        ...mockTicket,
        items: [],
        cgsBucketLink: 'test-image.webp',
      };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketWithImage);
      storageServiceMock.removeFile.mockRejectedValue(new Error('GCS Error'));

      await service.hardDelete(requester, 'report-1', 'ticket-1');

      expect(ticketsRepositoryMock.hardDelete).toHaveBeenCalledWith('ticket-1');
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.hardDelete(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(
        service.hardDelete(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not CREATED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.SUBMITTED,
      });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(
        service.hardDelete(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(
        service.hardDelete(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all tickets for a report when authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findByReportId.mockResolvedValue([
        { ...mockTicket, items: [] },
      ]);

      const fullResult = await service.findAll(requester, 'report-1');
      expect(fullResult).toHaveLength(1);
      expect(ticketsRepositoryMock.findByReportId).toHaveBeenCalledWith(
        'report-1',
      );
    });

    it('should throw TicketUnauthorizedException if not authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(false);

      await expect(service.findAll(requester, 'report-1')).rejects.toThrow(
        TicketUnauthorizedException,
      );
    });
  });

  describe('getTicketImageUrl', () => {
    it('should return the image URL for a ticket', async () => {
      const ticketWithImage = {
        ...mockTicket,
        items: [],
        cgsBucketLink: 'img-key.jpg',
      };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketWithImage);
      storageServiceMock.findFile.mockResolvedValue(
        'https://cdn.example.com/img.jpg',
      );

      const result = await service.getTicketImageUrl(
        requester,
        'report-1',
        'ticket-1',
      );
      expect(result.url).toBe('https://cdn.example.com/img.jpg');
    });

    it('should throw TicketNotFoundException when ticket has no image link', async () => {
      const ticketNoImage = { ...mockTicket, items: [], cgsBucketLink: null };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketNoImage);

      await expect(
        service.getTicketImageUrl(requester, 'report-1', 'ticket-1'),
      ).rejects.toThrow(TicketNotFoundException);
    });
  });
});
