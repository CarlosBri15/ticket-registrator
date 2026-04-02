import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let serviceMock: jest.Mocked<Partial<DepartmentService>>;

  const requester = {
    id: 'user-1',
    roleHierarchy: 100,
    companyId: 'comp-1',
    departmentIds: [],
  } as any;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAllByCompany: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        { provide: DepartmentService, useValue: serviceMock },
        {
          provide: RolesService,
          useValue: { getPermissionsForRoles: jest.fn() },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with requester, companyId and dto', async () => {
      const dto = { departmentName: 'Engineering' } as any;
      const expected = { id: 'dept-1', departmentName: 'Engineering' };
      (serviceMock.create as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(requester, 'comp-1', dto);

      expect(serviceMock.create).toHaveBeenCalledWith(requester, 'comp-1', dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAllByCompany with requester and companyId', async () => {
      const expected = [{ id: 'dept-1', departmentName: 'Engineering' }];
      (serviceMock.findAllByCompany as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findAll(requester, 'comp-1');

      expect(serviceMock.findAllByCompany).toHaveBeenCalledWith(
        requester,
        'comp-1',
      );
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with requester, companyId and id', async () => {
      const expected = { id: 'dept-1', departmentName: 'Engineering' };
      (serviceMock.findOne as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findOne(requester, 'comp-1', 'dept-1');

      expect(serviceMock.findOne).toHaveBeenCalledWith(
        requester,
        'comp-1',
        'dept-1',
      );
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with requester, companyId, id and dto', async () => {
      const dto = { departmentName: 'Updated' } as any;
      const expected = { id: 'dept-1', departmentName: 'Updated' };
      (serviceMock.update as jest.Mock).mockResolvedValue(expected);

      const result = await controller.update(
        requester,
        'comp-1',
        'dept-1',
        dto,
      );

      expect(serviceMock.update).toHaveBeenCalledWith(
        requester,
        'comp-1',
        'dept-1',
        dto,
      );
      expect(result).toBe(expected);
    });
  });

  describe('softDelete', () => {
    it('should call service.softDelete with requester, companyId and id', async () => {
      const expected = { deleted: true };
      (serviceMock.softDelete as jest.Mock).mockResolvedValue(expected);

      const result = await controller.softDelete(requester, 'comp-1', 'dept-1');

      expect(serviceMock.softDelete).toHaveBeenCalledWith(
        requester,
        'comp-1',
        'dept-1',
      );
      expect(result).toBe(expected);
    });
  });
});
