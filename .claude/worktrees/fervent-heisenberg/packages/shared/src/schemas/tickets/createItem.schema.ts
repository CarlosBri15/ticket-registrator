// shared/schemas/create-item.schema.ts
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number(),
  currency: z.string().min(1, 'Currency is required'),
});

export type CreateItemSchema = z.infer<typeof createItemSchema>;
