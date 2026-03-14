import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesService } from '../roles/roles.service';
import { Reflector } from '@nestjs/core';

describe('PermissionsController', () => {
    let controller: PermissionsController;
    let serviceMock: any;

    beforeEach(async () => {
        serviceMock = {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            seedDefaultPermissions: jest.fn(),
            assignToRole: jest.fn(),
            unassignFromRole: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PermissionsController],
            providers: [
                { provide: PermissionsService, useValue: serviceMock },
                { provide: RolesService, useValue: {} },
                Reflector,
            ],
        })
            .overrideGuard(PermissionsGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PermissionsController>(PermissionsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call findAll', async () => {
        await controller.findAll();
        expect(serviceMock.findAll).toHaveBeenCalled();
    });

    it('should call create', async () => {
        const dto = { name: 'p1' } as any;
        const requester = { id: 'u1' } as any;
        await controller.create(requester, dto);
        expect(serviceMock.create).toHaveBeenCalledWith(dto, requester);
    });

    it('should call update', async () => {
        const dto = { name: 'p1' } as any;
        const requester = { id: 'u1' } as any;
        await controller.update('1', requester, dto);
        expect(serviceMock.update).toHaveBeenCalledWith('1', dto, requester);
    });

    it('should call softDelete', async () => {
        const requester = { id: 'u1' } as any;
        await controller.softDelete('1', requester);
        expect(serviceMock.softDelete).toHaveBeenCalledWith('1', requester);
    });

    it('should call seed', async () => {
        await controller.seed();
        expect(serviceMock.seedDefaultPermissions).toHaveBeenCalled();
    });

    it('should call assignToRole', async () => {
        const dto = { roleId: 'r1', permissionId: 'p1' } as any;
        const requester = { id: 'u1' } as any;
        await controller.assignToRole(requester, dto);
        expect(serviceMock.assignToRole).toHaveBeenCalledWith(dto, requester);
    });

    it('should call unassignFromRole', async () => {
        const requester = { id: 'u1' } as any;
        await controller.unassignFromRole('r1', 'p1', requester);
        expect(serviceMock.unassignFromRole).toHaveBeenCalledWith('r1', 'p1', requester);
    });

});
