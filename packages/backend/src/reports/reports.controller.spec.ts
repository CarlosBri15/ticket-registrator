import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { BadRequestException } from '@nestjs/common';
import { Roles, permissions } from '@ticket-registrator/shared';

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

  const mockUser = {
    id: 'user-1',
    role: Roles.EMPLOYEE,
    companyId: 'comp-1',
    departmentId: 'dep-1',
    permissions: [permissions.VIEW_OWN_REPORTS],
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllPaginated', () => {
    it('should call findAllReportsPaginated with default pagination when no queries provided', async () => {
      mockReportsService.findAllReportsPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.findAllPaginated(mockRequest);

      expect(service.findAllReportsPaginated).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          role: mockUser.role,
          companyId: mockUser.companyId,
          departmentId: mockUser.departmentId,
          permissions: mockUser.permissions,
        },
        {
          page: 1,
          limit: 10,
          userId: undefined,
          name: undefined,
          startDate: undefined,
          endDate: undefined,
          status: undefined,
        }
      );
    });

    it('should pass correct parsed query parameters to the service', async () => {
      mockReportsService.findAllReportsPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      });

      await controller.findAllPaginated(
        mockRequest,
        '2',
        '5',
        'target-user',
        'Trip to NY',
        '2026-01-01',
        '2026-12-31',
        'Pending'
      );

      expect(service.findAllReportsPaginated).toHaveBeenCalledWith(
        expect.any(Object),
        {
          page: 2,
          limit: 5,
          userId: 'target-user',
          name: 'Trip to NY',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'Pending',
        }
      );
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for invalid status update payload', () => {
      // Missing 'status' or invalid value based on Zod schema
      const invalidBody = { status: 123 }; // status should be string usually

      expect(() => controller.update(mockRequest, 'rep-1', invalidBody)).toThrow(BadRequestException);
    });

    it('should call updateStatus when valid status payload is provided', () => {
      const validStatusBody = { status: 'Approved' };
      mockReportsService.updateStatus.mockResolvedValue({ id: 'rep-1', status: 'Approved' });

      controller.update(mockRequest, 'rep-1', validStatusBody);

      expect(service.updateStatus).toHaveBeenCalledWith('rep-1', validStatusBody);
    });
  });

  describe('findOne', () => {
    it('should construct requester and call findOne on service', async () => {
      mockReportsService.findOne.mockResolvedValue({ id: 'rep-1' });

      await controller.findOne(mockRequest, 'rep-1');

      expect(service.findOne).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          role: mockUser.role,
          companyId: mockUser.companyId,
          departmentId: mockUser.departmentId,
          permissions: mockUser.permissions,
        },
        'rep-1'
      );
    });
  });
});