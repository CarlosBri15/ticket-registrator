import { z } from 'zod';
import { TicketStatus } from '../../statuses/ticket-status';
import { ItemStatus } from '../../statuses/item-status';
import { createItemSchema } from '../../schemas/tickets/createItem.schema';

export const updateTicketFieldsSchema = z.object({
  cgs_bucket_link: z.string().optional(),
  payment_type: z.string().optional(),
  date: z.coerce.date().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  cgs_bucket_link_justification: z.string().optional(),
  last_four_digits: z.string().optional(),
  items: z.array(createItemSchema).optional(),
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

/**
 * Per-item status update payload used by the supervisor review flow. Targets
 * a single item by id and only carries its new status — leaves every other
 * item, the ticket fields and the report state untouched. Required because
 * `updateTicketFieldsSchema.items` is a destructive replace (delete + insert)
 * that was never designed for status mutations.
 */
export const updateItemStatusSchema = z.object({
  status: z.enum([
    ItemStatus.PENDING,
    ItemStatus.APPROVED,
    ItemStatus.REJECTED,
    ItemStatus.PARTIALLY_APPROVED,
  ]),
}).strict();

export type UpdateTicketStatus = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketLlm = z.infer<typeof updateTicketLlmSchema>;
export type UpdateTicketFields = z.infer<typeof updateTicketFieldsSchema>;
export type UpdateItemStatus = z.infer<typeof updateItemStatusSchema>;
