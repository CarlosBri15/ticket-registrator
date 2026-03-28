import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: CategoriesRepository;

  const mockRepository = {
    create: jest.fn(),
    createMany: jest.fn(),
    findByOrganization: jest.fn(),
    findById: jest.fn(),
    findAllSystemCategories: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'Food',
        description: 'Office meals',
        organizationId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = { id: 'uuid', ...dto, isSystem: false };
      mockRepository.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        organizationId: dto.organizationId,
        isSystem: false,
      });
    });
  });

  describe('findAllByOrganization', () => {
    it('should return an array of categories', async () => {
      const orgId = 'org-uuid';
      const result = [
        { id: '1', name: 'Cat 1', description: 'Desc', organizationId: orgId },
      ];
      mockRepository.findByOrganization.mockResolvedValue(result);

      expect(await service.findAllByOrganization(orgId)).toEqual(result);
      expect(mockRepository.findByOrganization).toHaveBeenCalledWith(orgId);
    });
  });

  describe('findAllSystemCategories', () => {
    it('should return all system categories', async () => {
      const result = [{ id: '1', name: 'System Cat', isSystem: true }];
      mockRepository.findAllSystemCategories.mockResolvedValue(result);

      expect(await service.findAllSystemCategories()).toEqual(result);
      expect(mockRepository.findAllSystemCategories).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = 'uuid';
      const dto: UpdateCategoryDto = { name: 'New Name' };
      const result = { id, name: 'New Name', description: 'Desc' };
      mockRepository.update.mockResolvedValue(result);

      expect(await service.update(id, dto)).toEqual(result);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {
        name: dto.name,
        description: dto.description,
        organizationId: dto.organizationId,
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a category', async () => {
      const id = 'uuid';
      mockRepository.softDelete.mockResolvedValue(true);

      expect(await service.softDelete(id)).toBe(true);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should permanently delete a category', async () => {
      const id = 'uuid';
      mockRepository.delete.mockResolvedValue(true);

      expect(await service.remove(id)).toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const id = 'uuid';
      const result = { id, name: 'Category 1' };
      mockRepository.findById.mockResolvedValue(result);

      expect(await service.findOne(id)).toEqual(result);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('createDefaultFromSystem', () => {
    it('should copy system categories to organization', async () => {
      const orgId = 'org-uuid';
      const systemCats = [
        { name: 'Cat 1', description: 'Desc 1', isSystem: true },
        { name: 'Cat 2', description: 'Desc 2', isSystem: true },
      ];
      mockRepository.findAllSystemCategories.mockResolvedValue(systemCats);
      mockRepository.createMany.mockResolvedValue([]);

      await service.createDefaultFromSystem(orgId);

      expect(mockRepository.createMany).toHaveBeenCalledWith([
        {
          name: 'Cat 1',
          description: 'Desc 1',
          organizationId: orgId,
          isSystem: false,
        },
        {
          name: 'Cat 2',
          description: 'Desc 2',
          organizationId: orgId,
          isSystem: false,
        },
      ]);
    });

    it('should copy selected system categories', async () => {
      const orgId = 'org-uuid';
      const systemCats = [
        { name: 'Cat 1', description: 'Desc 1', isSystem: true },
        { name: 'Cat 2', description: 'Desc 2', isSystem: true },
      ];
      mockRepository.findAllSystemCategories.mockResolvedValue(systemCats);
      mockRepository.createMany.mockResolvedValue([]);

      await service.createDefaultFromSystem(orgId, ['Cat 1']);

      expect(mockRepository.createMany).toHaveBeenCalledWith([
        {
          name: 'Cat 1',
          description: 'Desc 1',
          organizationId: orgId,
          isSystem: false,
        },
      ]);
    });

    it('should return empty array if no categories match', async () => {
      const orgId = 'org-uuid';
      const systemCats = [
        { name: 'Cat 1', description: 'Desc 1', isSystem: true },
        { name: 'Cat 2', description: 'Desc 2', isSystem: true },
      ];
      mockRepository.findAllSystemCategories.mockResolvedValue(systemCats);

      const result = await service.createDefaultFromSystem(orgId, ['Cat 3']);

      expect(result).toEqual([]);
      expect(mockRepository.createMany).not.toHaveBeenCalled();
    });
  });
});
