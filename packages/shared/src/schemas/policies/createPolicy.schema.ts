import { z } from 'zod';

export const ingestPolicySchema = z.object({
  companyId: z.string().uuid({ message: 'Invalid company ID format' }),
  name: z.string().min(1, { message: 'Policy name is required' }),
});
