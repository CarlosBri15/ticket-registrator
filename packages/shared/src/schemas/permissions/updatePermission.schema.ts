import { z } from 'zod';
import { createPermissionSchema } from './createPermission.schema';

export const updatePermissionSchema = createPermissionSchema.partial();

export type UpdatePermission = z.infer<typeof updatePermissionSchema>;
