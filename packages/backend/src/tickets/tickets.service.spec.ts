import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { ReportsRepository } from '../reports/reports.repository';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { GeminiService } from '../gemini/gemini.service';
import { StorageService } from '../storage/storage.service';
import { TicketStatus, ReportStatus, TicketLifecycle } from '@ticket-registrator/shared';
import { TicketUnauthorizedException } from './exceptions/tickets.exceptions';

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
  });

  describe('remove', () => {
    it('should soft delete ticket', async () => {
      reportsRepositoryMock.findById.mockResolvedValue(mockReport);
      ticketsAuthMock.validateCanModifyReport.mockResolvedValue(true);
      ticketsRepositoryMock.findById.mockResolvedValue(mockTicket);

      await service.remove(requester, 'report-1', 'ticket-1');
      expect(ticketsRepositoryMock.softDelete).toHaveBeenCalled();
    });
  });
});
