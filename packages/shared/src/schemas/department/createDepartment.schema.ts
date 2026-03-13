import { z } from 'zod';

export const registerDepartmentSchema = z.object({
  name: z.string(),
}).strict();

export type RegisterDepartmentSchema = z.infer<typeof registerDepartmentSchema>