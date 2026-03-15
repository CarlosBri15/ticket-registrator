import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let serviceMock: jest.Mocked<Partial<OrganizationService>>;

  const requester = {
    id: 'user-1',
    roleHierarchy: 100,
    companyId: 'comp-1',
    departmentIds: [],
  } as any;

  beforeEach(async () => {
    serviceMock = {
      onboard: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        { provide: OrganizationService, useValue: serviceMock },
        {
          provide: RolesService,
          useValue: { getPermissionsForRoles: jest.fn() },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('onboard', () => {
    it('should call service.onboard with requester and dto', async () => {
      const dto = { company: { name: 'Acme' }, admins: [] } as any;
      const expected = { company: { id: 'comp-1' }, admins: [] };
      (serviceMock.onboard as jest.Mock).mockResolvedValue(expected);

      const result = await controller.onboard(requester, dto);

      expect(serviceMock.onboard).toHaveBeenCalledWith(requester, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with requester', async () => {
      const expected = [{ id: 'comp-1', name: 'Acme' }];
      (serviceMock.findAll as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findAll(requester);

      expect(serviceMock.findAll).toHaveBeenCalledWith(requester);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const expected = { id: 'comp-1', name: 'Acme' };
      (serviceMock.findOne as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findOne('comp-1');

      expect(serviceMock.findOne).toHaveBeenCalledWith('comp-1');
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with requester, id and dto', async () => {
      const dto = { name: 'New Name' } as any;
      const expected = { id: 'comp-1', name: 'New Name' };
      (serviceMock.update as jest.Mock).mockResolvedValue(expected);

      const result = await controller.update(requester, 'comp-1', dto);

      expect(serviceMock.update).toHaveBeenCalledWith(requester, 'comp-1', dto);
      expect(result).toBe(expected);
    });
  });

  describe('softDelete', () => {
    it('should call service.softDelete with requester and id', async () => {
      const expected = { deleted: true };
      (serviceMock.softDelete as jest.Mock).mockResolvedValue(expected);

      const result = await controller.softDelete(requester, 'comp-1');

      expect(serviceMock.softDelete).toHaveBeenCalledWith(requester, 'comp-1');
      expect(result).toBe(expected);
    });
  });
});
