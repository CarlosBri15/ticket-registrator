import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { ReportsRepository } from '../reports/reports.repository';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { GeminiService } from '../gemini/gemini.service';
import { StorageService } from '../storage/storage.service';
import { TicketStatus, ReportStatus, TicketLifecycle, ItemStatus } from '@ticket-registrator/shared';
import {
  TicketUnauthorizedException,
  TicketNotFoundException,
  TicketStatusConflictException,
} from './exceptions/tickets.exceptions';
import { ReportNotFoundException } from '../reports/exceptions/reports.exceptions';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepositoryMock: any;
  let reportsRepositoryMock: any;
  let ticketsAuthMock: any;
  let geminiServiceMock: any;
  let storageServiceMock: any;

  const requester = { id: 'user-1' } as any;

  beforeEach(async () => {
    ticketsRepositoryMock = {
      findById: jest.fn(),
      findByReportId: jest.fn(),
      create: jest.fn(),
      updateWithHistory: jest.fn(),
      softDelete: jest.fn(),
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: TicketsRepository, useValue: ticketsRepositoryMock },
        { provide: ReportsRepository, useValue: reportsRepositoryMock },
        { provide: TicketsAuthorizationService, useValue: ticketsAuthMock },
        { provide: GeminiService, useValue: geminiServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  const mockReport = { id: 'report-1', userId: 'user-1', status: ReportStatus.CREATED, isVisible: true, currency: 'EUR' };
  const mockTicket = { id: 'ticket-1', reportId: 'report-1', userId: 'user-1', status: TicketStatus.PENDING, lifecycle: TicketLifecycle.DRAFT, version: 1, isVisible: true };

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({ items: [], total: 10 });
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any);
      expect(result.id).toBe('ticket-1');
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any))
        .rejects.toThrow(ReportNotFoundException);
    });

    it('should throw ReportNotFoundException when report is not visible', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({ ...mockReport, isVisible: false });
      await expect(service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any))
        .rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any))
        .rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not in CREATED status', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.SUBMITTED });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any))
        .rejects.toThrow(TicketStatusConflictException);
    });

    it('should parse gemini date correctly', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({
        items: [{ description: 'Coffee', price: 5 }],
        total: 5,
        date: '2024-01-15',
        payment_method: 'CARD',
        expense_type: 'MEALS',
      });
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any);
      expect(result.id).toBe('ticket-1');
    });

    it('should handle invalid date from gemini (0000-00-00)', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      storageServiceMock.uploadFile.mockResolvedValue('link');
      geminiServiceMock.extractReceipt.mockResolvedValue({ items: [], date: '0000-00-00', total: 0 });
      ticketsRepositoryMock.create.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.create(requester, 'report-1', { buffer: Buffer.from('f') } as any);
      expect(result.id).toBe('ticket-1');
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

      await expect(service.findOne(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.findOne(requester, 'report-1', 'ticket-1')).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketNotFoundException when ticket not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.findOne(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketNotFoundException);
    });

    it('should throw TicketNotFoundException when ticket reportId doesnt match', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue({ ...mockTicket, reportId: 'other' });
      await expect(service.findOne(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('update', () => {
    it('should update ticket fields and save history', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', { payment_type: 'CASH' });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should throw ReportNotFoundException when report not found for update', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.update(requester, 'report-1', 'ticket-1', {}))
        .rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(service.update(requester, 'report-1', 'ticket-1', {}))
        .rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not CREATED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.SUBMITTED });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(service.update(requester, 'report-1', 'ticket-1', {}))
        .rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found for update', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.update(requester, 'report-1', 'ticket-1', {}))
        .rejects.toThrow(TicketNotFoundException);
    });

    it('should return findOne result when no changes provided', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      const result = await service.update(requester, 'report-1', 'ticket-1', {});
      expect(ticketsRepositoryMock.updateWithHistory).not.toHaveBeenCalled();
    });

    it('should update with date field', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', { date: '2024-01-15' });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should update with null date', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      await service.update(requester, 'report-1', 'ticket-1', { date: null });
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
        expect.arrayContaining([expect.objectContaining({ name: 'Coffee', status: ItemStatus.PENDING })]),
      );
    });

    it('should throw TicketNotFoundException when ticket reportId mismatch', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue({ ...mockTicket, reportId: 'other-report' });
      await expect(service.update(requester, 'report-1', 'ticket-1', { payment_type: 'CASH' }))
        .rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status if report is SUBMITTED', async () => {
      const submittedReport = { ...mockReport, status: ReportStatus.SUBMITTED };
      reportsRepositoryMock.findById.mockResolvedValue(submittedReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);
      ticketsRepositoryMock.updateWithHistory.mockResolvedValue(mockTicket);

      const result = await service.updateStatus(requester, 'report-1', 'ticket-1', { status: TicketStatus.APPROVED, approved_amount: 10 });
      expect(ticketsRepositoryMock.updateWithHistory).toHaveBeenCalled();
    });

    it('should throw ReportNotFoundException when report not found', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.updateStatus(requester, 'report-1', 'ticket-1', { status: TicketStatus.APPROVED, approved_amount: 0 }))
        .rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketStatusConflictException when report not SUBMITTED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport); // CREATED status
      await expect(service.updateStatus(requester, 'report-1', 'ticket-1', { status: TicketStatus.APPROVED, approved_amount: 0 }))
        .rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found', async () => {
      const submittedReport = { ...mockReport, status: ReportStatus.SUBMITTED };
      reportsRepositoryMock.findById.mockResolvedValue(submittedReport);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.updateStatus(requester, 'report-1', 'ticket-1', { status: TicketStatus.APPROVED, approved_amount: 0 }))
        .rejects.toThrow(TicketNotFoundException);
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
      await expect(service.remove(requester, 'report-1', 'ticket-1')).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw TicketUnauthorizedException when user cannot modify report', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(false);
      await expect(service.remove(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketUnauthorizedException);
    });

    it('should throw TicketStatusConflictException when report is not CREATED', async () => {
      reportsRepositoryMock.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.SUBMITTED });
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      await expect(service.remove(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketStatusConflictException);
    });

    it('should throw TicketNotFoundException when ticket not found for remove', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(null);
      await expect(service.remove(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketNotFoundException);
    });

    it('should throw TicketNotFoundException when ticket reportId mismatch', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue({ ...mockTicket, reportId: 'other-report' });
      await expect(service.remove(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all tickets for a report when authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findByReportId.mockResolvedValue([{ ...mockTicket, items: [] }]);

      const result = await service.findAll(requester, 'report-1');
      expect(result).toHaveLength(1);
      expect(ticketsRepositoryMock.findByReportId).toHaveBeenCalledWith('report-1');
    });

    it('should throw TicketUnauthorizedException if not authorized', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(false);

      await expect(service.findAll(requester, 'report-1')).rejects.toThrow(TicketUnauthorizedException);
    });
  });

  describe('getTicketImageUrl', () => {
    it('should return the image URL for a ticket', async () => {
      const ticketWithImage = { ...mockTicket, items: [], cgsBucketLink: 'img-key.jpg' };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketWithImage);
      storageServiceMock.findFile.mockResolvedValue('https://cdn.example.com/img.jpg');

      const result = await service.getTicketImageUrl(requester, 'report-1', 'ticket-1');
      expect(result.url).toBe('https://cdn.example.com/img.jpg');
    });

    it('should throw TicketNotFoundException when ticket has no image link', async () => {
      const ticketNoImage = { ...mockTicket, items: [], cgsBucketLink: null };
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanViewReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(ticketNoImage);

      await expect(service.getTicketImageUrl(requester, 'report-1', 'ticket-1')).rejects.toThrow(TicketNotFoundException);
    });
  });
});
