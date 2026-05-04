import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) { }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create({
      name: dto.name,
      description: dto.description,
      color: dto.color ?? null,
      organizationId: dto.organizationId ?? null,
      isSystem: false,
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Category[]> {
    return this.categoriesRepository.findByOrganization(organizationId);
  }

  async findAllSystemCategories(): Promise<Category[]> {
    return this.categoriesRepository.findAllSystemCategories();
  }

  async findOne(id: string): Promise<Category | undefined> {
    return this.categoriesRepository.findById(id);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category | undefined> {
    return this.categoriesRepository.update(id, {
      name: dto.name,
      description: dto.description,
      color: dto.color,
      organizationId: dto.organizationId,
    });
  }

  async softDelete(id: string): Promise<boolean> {
    return this.categoriesRepository.softDelete(id);
  }

  async createDefaultFromSystem(
    organizationId: string,
    categoryNames?: string[],
  ): Promise<Category[]> {
    const systemCategories =
      await this.categoriesRepository.findAllSystemCategories();

    const categoriesToCopy =
      categoryNames && categoryNames.length > 0
        ? systemCategories.filter((cat) => categoryNames.includes(cat.name))
        : systemCategories;

    if (categoriesToCopy.length === 0) {
      return [];
    }

    const newCategories = categoriesToCopy.map((cat) => ({
      name: cat.name,
      description: cat.description,
      color: cat.color,
      organizationId: organizationId,
      isSystem: false,
    }));

    return this.categoriesRepository.createMany(newCategories);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
