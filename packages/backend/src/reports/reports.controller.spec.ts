import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Roles, permissions } from '@ticket-registrator/shared';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    create: jest.fn(),
    findAllReports: jest.fn(),
    findAllReportsPaginated: jest.fn(),
    findOne: jest.fn(),
    findUserReports: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    submitReport: jest.fn(),
    remove: jest.fn(),
  };

  const mockRolesService = {
    getPermissionsForRoles: jest.fn(),
  };

  const mockUserPayload = {
    id: 'user-1',
    role: Roles.EMPLOYEE,
    roles: ['Employee'],
    roleHierarchy: 1,
    companyId: 'comp-1',
    departmentId: 'dep-1',
    departmentIds: ['dep-1'],
    permissions: [permissions.VIEW_REPORTS],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: RolesService, useValue: mockRolesService },
        Reflector,
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllPaginated', () => {
    it('should call service with correct parameters', async () => {
      mockReportsService.findAllReportsPaginated.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.findAllPaginated(mockUserPayload as any, '1', '10');

      expect(service.findAllReportsPaginated).toHaveBeenCalledWith(
        mockUserPayload,
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      const dto = { status: 'Approved' } as any;
      await controller.updateStatus(mockUserPayload as any, 'rep-1', dto);
      expect(service.updateStatus).toHaveBeenCalledWith(
        mockUserPayload,
        'rep-1',
        dto,
      );
    });
  });

  describe('submitReport', () => {
    it('should call service.submitReport', async () => {
      await controller.submitReport(mockUserPayload as any, 'rep-1');
      expect(service.submitReport).toHaveBeenCalledWith(
        mockUserPayload,
        'rep-1',
      );
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = {
        name: 'Trip',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        currency: 'USD',
      } as any;
      mockReportsService.create.mockResolvedValue({ id: 'rep-1' });

      const result = await controller.create(mockUserPayload as any, dto);
      expect(service.create).toHaveBeenCalledWith(mockUserPayload, dto);
      expect(result).toEqual({ id: 'rep-1' });
    });
  });

  describe('findAll', () => {
    it('should call service.findAllReports', async () => {
      mockReportsService.findAllReports.mockResolvedValue([]);

      await controller.findAll(mockUserPayload as any);
      expect(service.findAllReports).toHaveBeenCalledWith(mockUserPayload);
    });
  });

  describe('findUserReports', () => {
    it('should call service.findUserReports with given userId', async () => {
      mockReportsService.findUserReports.mockResolvedValue([]);

      await controller.findUserReports(mockUserPayload as any, 'target-user');
      expect(service.findUserReports).toHaveBeenCalledWith(
        mockUserPayload,
        'target-user',
      );
    });

    it('should use requester id when no userId is given', async () => {
      mockReportsService.findUserReports.mockResolvedValue([]);

      await controller.findUserReports(mockUserPayload as any, undefined);
      expect(service.findUserReports).toHaveBeenCalledWith(
        mockUserPayload,
        mockUserPayload.id,
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      mockReportsService.findOne.mockResolvedValue({ id: 'rep-1' } as any);

      const result = await controller.findOne(mockUserPayload as any, 'rep-1');
      expect(service.findOne).toHaveBeenCalledWith(mockUserPayload, 'rep-1');
      expect(result).toEqual({ id: 'rep-1' });
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'Updated' } as any;
      mockReportsService.update.mockResolvedValue({
        id: 'rep-1',
        name: 'Updated',
      } as any);

      await controller.update(mockUserPayload as any, 'rep-1', dto);
      expect(service.update).toHaveBeenCalledWith(
        mockUserPayload,
        'rep-1',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockReportsService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(mockUserPayload as any, 'rep-1');
      expect(service.remove).toHaveBeenCalledWith(mockUserPayload, 'rep-1');
      expect(result).toEqual({ deleted: true });
    });
  });
});
