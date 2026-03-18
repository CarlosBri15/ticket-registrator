import { z } from 'zod';
import { TicketStatus } from '../../statuses/ticket-status';
import { createItemSchema } from '../../schemas/tickets/createItem.schema';

export const updateTicketFieldsSchema = z.object({
  cgs_bucket_link: z.string().optional(),
  payment_type: z.string().optional(),
  expense_type: z.string().optional(),
  date: z.coerce.date().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  cgs_bucket_link_justification: z.string().optional(),
  last_four_digits: z.string().optional(),
  items: z.array(createItemSchema).optional(),
  isVisible: z.boolean().optional(),
}).strict();

export const updateTicketStatusSchema = z.object({
  status: z.enum([TicketStatus.PENDING, TicketStatus.APPROVED, TicketStatus.REJECTED]),
  approved_amount: z.number(),
}).strict();

export const updateTicketLlmSchema = z.object({
  llm_appproved_percentage: z.number().optional(),
  llm_recomendation: z.string().optional(),
  llm_suggested_amount: z.number().optional(),
  llm_suggested_currency: z.string().optional(),
}).strict();

export type UpdateTicketStatus = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketLlm = z.infer<typeof updateTicketLlmSchema>;
export type UpdateTicketFields = z.infer<typeof updateTicketFieldsSchema>;
