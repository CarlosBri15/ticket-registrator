import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let serviceMock: jest.Mocked<Partial<UsersService>>;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMe: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: serviceMock },
        {
          provide: RolesService,
          useValue: { getPermissionsForRoles: jest.fn() },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { name: 'John', email: 'john@example.com' } as any;
      const user = {
          roleId: 'r1',
          roleName: 'Employee',
          roleHierarchy: 10,
          companyId: 'c1',
          departmentIds: [],
          permissions: [],
      };
      (serviceMock.create as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await controller.create(dto, user as any);
      expect(serviceMock.create).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const user = {
          id: 'u1',
          roleId: 'r1',
          roleName: 'Employee',
          roleHierarchy: 10,
          companyId: 'c1',
          departmentIds: [],
          permissions: [],
      };
      (serviceMock.findAll as jest.Mock).mockResolvedValue([]);

      await controller.findAll(user as any);
      expect(serviceMock.findAll).toHaveBeenCalledWith(user);
    });
  });

  describe('findMe', () => {
    it('should call service.findMe with user id', async () => {
      const user = { id: 'user-1' };
      (serviceMock.findMe as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await controller.findMe(user as any);
      expect(serviceMock.findMe).toHaveBeenCalledWith('user-1');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const user = {
          id: 'u1',
          roleId: 'r1',
          roleName: 'Employee',
          roleHierarchy: 10,
          companyId: 'c1',
          departmentIds: [],
          permissions: [],
      };
      const dto = { name: 'Updated' } as any;
      (serviceMock.update as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await controller.update(user as any, 'user-1', dto);
      expect(serviceMock.update).toHaveBeenCalledWith('user-1', dto, user);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const user = {
          id: 'u1',
          roleId: 'r1',
          roleName: 'Employee',
          roleHierarchy: 10,
          companyId: 'c1',
          departmentIds: [],
          permissions: [],
      };
      (serviceMock.remove as jest.Mock).mockResolvedValue({ deleted: true });

      await controller.remove('user-1', user as any);
      expect(serviceMock.remove).toHaveBeenCalledWith('user-1', user);
    });
  });
});
