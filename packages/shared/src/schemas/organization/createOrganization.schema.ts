import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  name: z.string(),
})

export type RegisterOrganizationSchema = z.infer<typeof registerOrganizationSchema>;