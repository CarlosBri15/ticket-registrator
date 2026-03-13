import { z } from 'zod';

export const createRoleSchema = z.object({
    name: z.string().min(2).max(255),
    hierarchy: z.number().int().min(1).max(4), 
    description: z.string().optional(),
}).strict();

export type CreateRoleSchema = z.infer<typeof createRoleSchema>;
