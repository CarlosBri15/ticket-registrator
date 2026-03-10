import { z } from 'zod';

export const assignPermissionSchema = z.object({
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    companyId: z.string().uuid().nullable().optional(),
});

export type AssignPermission = z.infer<typeof assignPermissionSchema>;
