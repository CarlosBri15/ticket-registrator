import { z } from 'zod';

export const updateOrganizationSchema = z.object({
    name: z.string().min(2, "Company name is too short").optional(),
}).strict();

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;
