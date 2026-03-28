import { createZodDto } from 'nestjs-zod';
import { createCategorySchema } from '@ticket-registrator/shared';

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}
