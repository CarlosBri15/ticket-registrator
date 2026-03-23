import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Reflector } from '@nestjs/core';

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let service: CategoriesService;

    const mockService = {
        create: jest.fn(),
        findAllByOrganization: jest.fn(),
        findAllSystemCategories: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        createDefaultFromSystem: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: mockService,
                },
                Reflector,
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: () => true })
            .overrideGuard(PermissionsGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CategoriesController>(CategoriesController);
        service = module.get<CategoriesService>(CategoriesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateCategoryDto = {
                name: 'Food',
                description: 'Meals',
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
            };
            await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAllByOrganization', () => {
        it('should call service.findAllByOrganization', async () => {
            const orgId = '123e4567-e89b-12d3-a456-426614174000';
            await controller.findAllByOrganization(orgId);
            expect(service.findAllByOrganization).toHaveBeenCalledWith(orgId);
        });
    });

    describe('findAllSystem', () => {
        it('should call service.findAllSystemCategories', async () => {
            await controller.findAllSystem();
            expect(service.findAllSystemCategories).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            await controller.findOne(id);
            expect(service.findOne).toHaveBeenCalledWith(id);
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            const dto: UpdateCategoryDto = { name: 'New Name' };
            await controller.update(id, dto);
            expect(service.update).toHaveBeenCalledWith(id, dto);
        });
    });

    describe('remove', () => {
        it('should call service.softDelete', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            await controller.remove(id);
            expect(service.softDelete).toHaveBeenCalledWith(id);
        });
    });

    describe('createFromDefaults', () => {
        it('should call service.createDefaultFromSystem', async () => {
            const orgId = '123e4567-e89b-12d3-a456-426614174000';
            const body = { categoryNames: ['Food'] };
            await controller.createFromDefaults(orgId, body);
            expect(service.createDefaultFromSystem).toHaveBeenCalledWith(
                orgId,
                body.categoryNames,
            );
        });
    });
});
