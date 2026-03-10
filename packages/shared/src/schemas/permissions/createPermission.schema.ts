import { z } from 'zod';

export const createPermissionSchema = z.object({
    name: z.string().min(1).max(150),
    description: z.string().max(255).optional(),
});

export type CreatePermission = z.infer<typeof createPermissionSchema>;
