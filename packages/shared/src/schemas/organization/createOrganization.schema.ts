import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  name: z.string(),
  isVisible: z.boolean().optional()
})

export type RegisterOrganizationSchema = z.infer<typeof registerOrganizationSchema>;