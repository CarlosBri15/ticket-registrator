import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().min(1, 'Description is required').refine(
        (val) => val.trim().split(/\s+/).length <= 10,
        { message: 'Description must be at most 10 words' }
    ),
    organizationId: z.string().uuid('Invalid organization ID').nullable().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
