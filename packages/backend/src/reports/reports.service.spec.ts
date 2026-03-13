import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { ReportsAuthorizationService } from './reports-authorization.service';
import { ReportStatus, AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import {
  ReportNotFoundException,
  ReportAlreadyExistsException,
  ReportUnauthorizedException,
  ReportStatusConflictException
} from './exceptions/reports.exceptions';

describe('ReportsService', () => {
  let service: ReportsService;
  let repositoryMock: any;
  let authServiceMock: any;

  const requester = {
    id: 'user-1',
    roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
    companyId: 'company-1',
    departmentIds: ['dept-1'],
  } as any;

  beforeEach(async () => {
    repositoryMock = {
      findById: jest.fn(),
      findWithFilters: jest.fn(),
      findByUserId: jest.fn(),
      findOverlapping: jest.fn(),
      create: jest.fn(),
      updateWithCondition: jest.fn(),
      transaction: jest.fn(),
    };

    authServiceMock = {
      getVisibleUser: jest.fn(),
      canViewUserReports: jest.fn(),
      canViewReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ReportsRepository, useValue: repositoryMock },
        { provide: ReportsAuthorizationService, useValue: authServiceMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('create', () => {
    const dto = {
      name: 'Business Trip',
      start_date: '2023-01-01',
      end_date: '2023-01-05',
      currency: 'USD',
    } as any;

    it('should create a report if no overlap exists', async () => {
      authServiceMock.getVisibleUser.mockResolvedValue({ id: 'user-1' });
      repositoryMock.findOverlapping.mockResolvedValue(null);
      repositoryMock.create.mockResolvedValue({
        id: 'report-1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: new Date(dto.start_date),
        endDate: new Date(dto.end_date)
      });

      const result = await service.create(requester, dto);
      expect(result).toBeDefined();
      expect(repositoryMock.create).toHaveBeenCalled();
    });

    it('should throw ReportAlreadyExistsException if overlap exists', async () => {
      authServiceMock.getVisibleUser.mockResolvedValue({ id: 'user-1' });
      repositoryMock.findOverlapping.mockResolvedValue({ id: 'existing-report' });

      await expect(service.create(requester, dto)).rejects.toThrow(ReportAlreadyExistsException);
    });
  });

  describe('findOne', () => {
    it('should return report if authorized', async () => {
      const mockReport = {
        id: 'report-1',
        userId: 'user-1',
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: new Date(),
        endDate: new Date()
      };
      repositoryMock.findById.mockResolvedValue(mockReport);
      authServiceMock.canViewReport.mockResolvedValue(true);

      const result = await service.findOne(requester, 'report-1');
      expect(result).toBeDefined();
    });

    it('should throw ReportNotFoundException if report does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);
      await expect(service.findOne(requester, 'report-1')).rejects.toThrow(ReportNotFoundException);
    });

    it('should throw ReportUnauthorizedException if not authorized', async () => {
      const mockReport = { id: 'report-1', userId: 'other-user', isVisible: true };
      repositoryMock.findById.mockResolvedValue(mockReport);
      authServiceMock.canViewReport.mockResolvedValue(false);

      await expect(service.findOne(requester, 'report-1')).rejects.toThrow(ReportUnauthorizedException);
    });
  });

  describe('submitReport', () => {
    it('should submit report if in CREATED state', async () => {
      repositoryMock.updateWithCondition.mockResolvedValue({
        id: 'report-1',
        status: ReportStatus.SUBMITTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: new Date(),
        endDate: new Date()
      });

      const result = await service.submitReport(requester, 'report-1');
      expect(result.status).toBe(ReportStatus.SUBMITTED);
    });

    it('should throw ReportStatusConflictException if update fails', async () => {
      repositoryMock.updateWithCondition.mockResolvedValue(null);
      await expect(service.submitReport(requester, 'report-1')).rejects.toThrow(ReportStatusConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update status if report is in SUBMITTED state', async () => {
      repositoryMock.updateWithCondition.mockResolvedValue({
        id: 'report-1',
        status: ReportStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: new Date(),
        endDate: new Date()
      });

      const result = await service.updateStatus(requester, 'report-1', { status: ReportStatus.APPROVED });
      expect(result.status).toBe(ReportStatus.APPROVED);
    });
  });

  describe('remove', () => {
    it('should soft delete report and its tickets', async () => {
      const mockReport = { id: 'report-1', userId: 'user-1', status: ReportStatus.CREATED };
      repositoryMock.findById.mockResolvedValue(mockReport);

      await service.remove(requester, 'report-1');
      expect(repositoryMock.transaction).toHaveBeenCalled();
    });

    it('should throw ReportStatusConflictException if report is already submitted', async () => {
      const mockReport = { id: 'report-1', userId: 'user-1', status: ReportStatus.SUBMITTED };
      repositoryMock.findById.mockResolvedValue(mockReport);

      await expect(service.remove(requester, 'report-1')).rejects.toThrow(ReportStatusConflictException);
    });
  });
});