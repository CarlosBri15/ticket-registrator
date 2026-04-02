import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number(),
  currency: z.string().min(1, 'Currency is required'),
  expense_type: z.string().optional(),
});

export type CreateItemSchema = z.infer<typeof createItemSchema>;
