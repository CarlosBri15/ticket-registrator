import { z } from 'zod';
import { permissions } from '../../user-roles/permissions';

export const userPermissionOverrideSchema = z.object({
    userId: z.string().uuid(),
    permissions: z.array(z.nativeEnum(permissions as any)),
    isActive: z.boolean().default(true),
});

export type UserPermissionOverride = z.infer<typeof userPermissionOverrideSchema>;
