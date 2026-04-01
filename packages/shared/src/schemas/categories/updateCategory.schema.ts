import { createCategorySchema } from './createCategory.schema';
import { z } from 'zod';

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
