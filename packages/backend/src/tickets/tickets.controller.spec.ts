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
});
