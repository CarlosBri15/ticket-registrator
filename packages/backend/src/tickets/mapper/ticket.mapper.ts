import { Ticket } from '../schemas/ticket.schema';
import {
  ITicket,
  TicketStatusType,
  TicketLifecycleType,
} from '@ticket-registrator/shared';
import { Item } from '../../items/schemas/item.schema';

export const mapTicketToITicket = (
  ticketDoc: Ticket & { items?: Item[] },
): ITicket => ({
  id: ticketDoc.id,
  report_id: ticketDoc.reportId,
  status: ticketDoc.status as TicketStatusType,
  lifecycle: ticketDoc.lifecycle as TicketLifecycleType,
  version: ticketDoc.version,
  cgs_bucket_link: ticketDoc.cgsBucketLink,
  payment_type: ticketDoc.paymentType,
  date: ticketDoc.date?.toISOString() ?? null,
  location_name: ticketDoc.locationName,
  location_address: ticketDoc.locationAddress,
  amount: ticketDoc.amount,
  currency: ticketDoc.currency,
  converted_amount: ticketDoc.convertedAmount,
  converted_currency: ticketDoc.convertedCurrency,
  cgs_bucket_link_justification: ticketDoc.cgsBucketLinkJustification,
  last_four_digits: ticketDoc.lastFourDigits,
  image_id: ticketDoc.imageId,
  flag: ticketDoc.flag,
  llm_comment: ticketDoc.llmComment ?? null,
  items:
    ticketDoc.items?.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
      expense_type: item.expenseType,
    })) ?? [],
  createdAt: ticketDoc.createdAt?.toISOString() ?? new Date().toISOString(),
  updatedAt: ticketDoc.updatedAt?.toISOString() ?? new Date().toISOString(),
});
