import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketStatus } from '@ticket-registrator/shared';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('TicketsController', () => {
  let controller: TicketsController;
  let serviceMock: any;
  let rolesServiceMock: any;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      getTicketImageUrl: jest.fn(),
    };

    rolesServiceMock = {
      getPermissionsForRoles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: TicketsService, useValue: serviceMock },
        { provide: RolesService, useValue: rolesServiceMock },
        Reflector,
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const requester = { id: 'user-1' } as any;
      const file = {} as any;
      serviceMock.create.mockResolvedValue({ id: 'ticket-1' });

      const result = await controller.create(requester, 'report-1', file);
      expect(serviceMock.create).toHaveBeenCalledWith(requester, 'report-1', file);
      expect(result.id).toBe('ticket-1');
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      const requester = { id: 'user-1' } as any;
      const dto = { status: TicketStatus.APPROVED, approved_amount: 100 };
      serviceMock.updateStatus.mockResolvedValue({ id: 'ticket-1', status: TicketStatus.APPROVED });

      const result = await controller.updateStatus(requester, 'report-1', 'ticket-1', dto);
      expect(serviceMock.updateStatus).toHaveBeenCalledWith(requester, 'report-1', 'ticket-1', dto);
      expect(result.status).toBe(TicketStatus.APPROVED);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const requester = { id: 'user-1' } as any;
      serviceMock.findAll.mockResolvedValue([{ id: 'ticket-1' } as any]);

      const result = await controller.findAll(requester, 'report-1');
      expect(serviceMock.findAll).toHaveBeenCalledWith(requester, 'report-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const requester = { id: 'user-1' } as any;
      serviceMock.findOne.mockResolvedValue({ id: 'ticket-1' } as any);

      const result = await controller.findOne(requester, 'report-1', 'ticket-1');
      expect(serviceMock.findOne).toHaveBeenCalledWith(requester, 'report-1', 'ticket-1');
      expect(result).toEqual({ id: 'ticket-1' });
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const requester = { id: 'user-1' } as any;
      const dto = { payment_type: 'CASH' } as any;
      serviceMock.update.mockResolvedValue({ id: 'ticket-1' } as any);

      await controller.update(requester, 'report-1', 'ticket-1', dto);
      expect(serviceMock.update).toHaveBeenCalledWith(requester, 'report-1', 'ticket-1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const requester = { id: 'user-1' } as any;
      serviceMock.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(requester, 'report-1', 'ticket-1');
      expect(serviceMock.remove).toHaveBeenCalledWith(requester, 'report-1', 'ticket-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getImage', () => {
    it('should call service.getTicketImageUrl', async () => {
      const requester = { id: 'user-1' } as any;
      serviceMock.getTicketImageUrl.mockResolvedValue({ url: 'https://cdn.example.com/img.jpg' });

      const result = await controller.getImage(requester, 'report-1', 'ticket-1');
      expect(serviceMock.getTicketImageUrl).toHaveBeenCalledWith(requester, 'report-1', 'ticket-1');
      expect(result.url).toBe('https://cdn.example.com/img.jpg');
    });
  });
});
