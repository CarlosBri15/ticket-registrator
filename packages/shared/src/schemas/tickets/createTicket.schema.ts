import { z } from 'zod';
import { createItemSchema } from './createItem.schema';

export const createTicketSchema = z.object({
  cgs_bucket_link: z.string().optional(),
  payment_type: z.string().optional(),
  expense_type: z.string().optional(),
  date: z.coerce.date().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  converted_amount: z.number().optional(),
  converted_currency: z.string().optional(),
  cgs_bucket_link_justification: z.string().optional(),
  last_four_digits: z.string().optional(),
  items: z.array(createItemSchema).optional(),
  isVisible: z.boolean().optional()
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
