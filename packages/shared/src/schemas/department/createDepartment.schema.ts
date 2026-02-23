import { z } from 'zod';

export const registerDepartmentSchema = z.object({
  name: z.string(),
  isVisible: z.boolean().optional()
})

export type RegisterDepartmentSchema = z.infer<typeof registerDepartmentSchema>