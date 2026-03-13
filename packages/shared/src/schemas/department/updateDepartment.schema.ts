import { z } from 'zod';

export const updateDepartmentSchema = z.object({
    name: z.string().min(2, "Department name is too short").optional(),
}).strict();

export type UpdateDepartmentSchema = z.infer<typeof updateDepartmentSchema>;
