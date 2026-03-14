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

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      repositoryMock.transaction.mockImplementation(async (cb: any) => cb(mockTx));

      await service.remove(requester, 'report-1');
      expect(repositoryMock.transaction).toHaveBeenCalled();
    });

    it('should throw ReportStatusConflictException if report is already submitted', async () => {
      const mockReport = { id: 'report-1', userId: 'user-1', status: ReportStatus.SUBMITTED };
      repositoryMock.findById.mockResolvedValue(mockReport);

      await expect(service.remove(requester, 'report-1')).rejects.toThrow(ReportStatusConflictException);
    });
  });

  describe('findUserReports', () => {
    const mockReportDoc = {
      id: 'report-1', userId: 'user-1', name: 'Trip', status: ReportStatus.CREATED,
      startDate: new Date(), endDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
      currency: 'USD', type: '', requestedAmount: 0, approvedAmount: 0,
    };

    it('should return reports when authorized', async () => {
      authServiceMock.canViewUserReports.mockResolvedValue(true);
      repositoryMock.findByUserId.mockResolvedValue([mockReportDoc]);

      const result = await service.findUserReports(requester, 'user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('report-1');
    });

    it('should throw ReportUnauthorizedException when not authorized', async () => {
      authServiceMock.canViewUserReports.mockResolvedValue(false);

      await expect(service.findUserReports(requester, 'user-1')).rejects.toThrow(ReportUnauthorizedException);
    });
  });

  describe('findAllReports', () => {
    it('should return all visible reports for authority level', async () => {
      const globalRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.GLOBAL, id: 'admin-1' } as any;
      const mockReportDoc = {
        id: 'report-1', userId: 'user-1', name: 'Trip', status: ReportStatus.CREATED,
        startDate: new Date(), endDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        currency: 'USD', type: '', requestedAmount: 0, approvedAmount: 0,
      };
      repositoryMock.findWithFilters.mockResolvedValue({ data: [mockReportDoc], total: 1 });

      const result = await service.findAllReports(globalRequester);
      expect(repositoryMock.findWithFilters).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should use company-level authority filter', async () => {
      const companyRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.COMPANY } as any;
      repositoryMock.findWithFilters.mockResolvedValue({ data: [], total: 0 });

      await service.findAllReports(companyRequester);
      expect(repositoryMock.findWithFilters).toHaveBeenCalled();
    });

    it('should use employee-level authority filter (below department)', async () => {
      const employeeRequester = { ...requester, roleHierarchy: 1 } as any;
      repositoryMock.findWithFilters.mockResolvedValue({ data: [], total: 0 });

      await service.findAllReports(employeeRequester);
      expect(repositoryMock.findWithFilters).toHaveBeenCalled();
    });
  });

  describe('findAllReportsPaginated', () => {
    it('should return paginated reports with default page and limit', async () => {
      const mockReportDoc = {
        id: 'report-1', userId: 'user-1', name: 'Trip', status: ReportStatus.CREATED,
        startDate: new Date(), endDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        currency: 'USD', type: '', requestedAmount: 0, approvedAmount: 0,
      };
      repositoryMock.findWithFilters.mockResolvedValue({ data: [mockReportDoc], total: 1 });

      const result = await service.findAllReportsPaginated(requester, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should apply userId, name, status, startDate, endDate filters', async () => {
      repositoryMock.findWithFilters.mockResolvedValue({ data: [], total: 0 });

      await service.findAllReportsPaginated(requester, {
        userId: 'user-1',
        name: 'Trip',
        status: ReportStatus.SUBMITTED,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(repositoryMock.findWithFilters).toHaveBeenCalled();
    });
  });

  describe('remove (full coverage)', () => {
    it('should throw ReportNotFoundException when report belongs to other user', async () => {
      const otherReport = { id: 'report-1', userId: 'other-user', status: ReportStatus.CREATED };
      repositoryMock.findById.mockResolvedValue(otherReport);

      await expect(service.remove(requester, 'report-1')).rejects.toThrow(ReportNotFoundException);
    });
  });

  describe('update (full coverage)', () => {
    it('should update all optional fields in prepareUpdateData', async () => {
      const mockReportDoc = {
        id: 'report-1', userId: 'user-1', name: 'New', status: ReportStatus.CREATED,
        startDate: new Date(), endDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        currency: 'USD', type: 'TRAVEL', requestedAmount: 0, approvedAmount: 0,
      };
      repositoryMock.updateWithCondition.mockResolvedValue(mockReportDoc);

      const result = await service.update(requester, 'report-1', {
        name: 'New',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        type: 'TRAVEL',
        isVisible: true,
      });
      expect(result.name).toBe('New');
    });
  });

  describe('update', () => {
    it('should update report fields successfully', async () => {
      const mockReportDoc = {
        id: 'report-1', userId: 'user-1', name: 'Updated', status: ReportStatus.CREATED,
        startDate: new Date(), endDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        currency: 'USD', type: '', requestedAmount: 0, approvedAmount: 0,
      };
      repositoryMock.updateWithCondition.mockResolvedValue(mockReportDoc);

      const result = await service.update(requester, 'report-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw ReportNotFoundException if update returns null', async () => {
      repositoryMock.updateWithCondition.mockResolvedValue(null);

      await expect(service.update(requester, 'report-1', { name: 'X' })).rejects.toThrow(ReportNotFoundException);
    });
  });
});