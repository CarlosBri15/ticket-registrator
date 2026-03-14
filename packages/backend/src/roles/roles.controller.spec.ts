import { Test, TestingModule } from '@nestjs/testing';
import { SystemRolesController, CompanyRolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { SeedService } from '../seed/seed.service';
import { Roles } from '@ticket-registrator/shared';

describe('RolesControllers', () => {
  let systemController: SystemRolesController;
  let companyController: CompanyRolesController;
  let rolesServiceMock: any;
  let seedServiceMock: any;

  beforeEach(async () => {
    rolesServiceMock = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
    };

    seedServiceMock = {
      seedDefaultPermissions: jest.fn(),
      seedDefaultRoles: jest.fn(),
      seedDefaultRolePermissions: jest.fn(),
      seedSystemAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemRolesController, CompanyRolesController],
      providers: [
        { provide: RolesService, useValue: rolesServiceMock },
        { provide: SeedService, useValue: seedServiceMock },
      ],
    }).compile();

    systemController = module.get<SystemRolesController>(SystemRolesController);
    companyController = module.get<CompanyRolesController>(CompanyRolesController);
  });

  describe('SystemRolesController', () => {
    it('should call seedAll', async () => {
      await systemController.seedAll();
      expect(seedServiceMock.seedSystemAll).toHaveBeenCalled();
    });

    it('should call seedPermissions', async () => {
      await systemController.seedPermissions();
      expect(seedServiceMock.seedDefaultPermissions).toHaveBeenCalled();
    });

    it('should call seedRoles', async () => {
      await systemController.seedRoles();
      expect(seedServiceMock.seedDefaultRoles).toHaveBeenCalled();
    });

    it('should call seedRolePermissions', async () => {
      await systemController.seedRolePermissions();
      expect(seedServiceMock.seedDefaultRolePermissions).toHaveBeenCalled();
    });

    it('should call findAll with null companyId', async () => {
      await systemController.findAll();
      expect(rolesServiceMock.findAll).toHaveBeenCalledWith(null);
    });
  });

  describe('CompanyRolesController', () => {
    const requester = { id: 'user-1', role: Roles.ADMIN } as any;

    it('should call create', async () => {
      const dto = { name: 'Role', hierarchy: 1 };
      await companyController.create(requester, 'comp-1', dto);
      expect(rolesServiceMock.create).toHaveBeenCalledWith('comp-1', dto, requester);
    });

    it('should call findAll with companyId', async () => {
      await companyController.findAll('comp-1');
      expect(rolesServiceMock.findAll).toHaveBeenCalledWith('comp-1');
    });

    it('should call findOne with id and companyId', async () => {
      await companyController.findOne('comp-1', 'role-1');
      expect(rolesServiceMock.findOne).toHaveBeenCalledWith('role-1', 'comp-1');
    });

    it('should call softDelete', async () => {
      await companyController.softDelete(requester, 'comp-1', 'role-1');
      expect(rolesServiceMock.softDelete).toHaveBeenCalledWith('role-1', 'comp-1', requester);
    });
  });
});
