import { createZodDto } from 'nestjs-zod';
import { updateCategorySchema } from '@ticket-registrator/shared';

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
