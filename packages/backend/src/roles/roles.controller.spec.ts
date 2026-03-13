import { Test, TestingModule } from '@nestjs/testing';
import { SystemRolesController, CompanyRolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Roles } from '@ticket-registrator/shared';

describe('RolesControllers', () => {
  let systemController: SystemRolesController;
  let companyController: CompanyRolesController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      seedDefaultPermissions: jest.fn(),
      seedDefaultRoles: jest.fn(),
      seedDefaultRolePermissions: jest.fn(),
      seedSystemAll: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemRolesController, CompanyRolesController],
      providers: [
        { provide: RolesService, useValue: serviceMock },
      ],
    }).compile();

    systemController = module.get<SystemRolesController>(SystemRolesController);
    companyController = module.get<CompanyRolesController>(CompanyRolesController);
  });

  describe('SystemRolesController', () => {
    it('should call seedAll', async () => {
      await systemController.seedAll();
      expect(serviceMock.seedSystemAll).toHaveBeenCalled();
    });

    it('should call findAll with null companyId', async () => {
      await systemController.findAll();
      expect(serviceMock.findAll).toHaveBeenCalledWith(null);
    });
  });

  describe('CompanyRolesController', () => {
    const requester = { id: 'user-1', role: Roles.ADMIN } as any;

    it('should call create', async () => {
      const dto = { name: 'Role', hierarchy: 1 };
      await companyController.create(requester, 'comp-1', dto);
      expect(serviceMock.create).toHaveBeenCalledWith('comp-1', dto, requester);
    });

    it('should call findAll with companyId', async () => {
      await companyController.findAll('comp-1');
      expect(serviceMock.findAll).toHaveBeenCalledWith('comp-1');
    });

    it('should call softDelete', async () => {
      await companyController.softDelete(requester, 'comp-1', 'role-1');
      expect(serviceMock.softDelete).toHaveBeenCalledWith('role-1', 'comp-1', requester);
    });
  });
});
