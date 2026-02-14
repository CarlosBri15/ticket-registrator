import { TicketDocument } from '../schemas/ticket.schema';
import { ITicket, IItem } from '@ticket-registrator/shared';

export const mapTicketToITicket = (ticketDoc: TicketDocument): ITicket => ({
  id: ticketDoc._id.toString(),
  report_id: ticketDoc.report_id.toString(),
  status: ticketDoc.status,
  lifecycle: ticketDoc.lifecycle,
  version: ticketDoc.version,
  cgs_bucket_link: ticketDoc.cgs_bucket_link,
  payment_type: ticketDoc.payment_type,
  expense_type: ticketDoc.expense_type,
  date: ticketDoc.date?.toISOString() ?? null,
  location_name: ticketDoc.location_name,
  location_address: ticketDoc.location_address,
  amount: ticketDoc.amount,
  currency: ticketDoc.currency,
  converted_amount: ticketDoc.converted_amount,
  converted_currency: ticketDoc.converted_currency,
  cgs_bucket_link_justification: ticketDoc.cgs_bucket_link_justification,
  last_four_digits: ticketDoc.last_four_digits,
  items: ticketDoc.items?.map((item): IItem => ({
    id:'',
    name: item.name,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
  })) ?? [],
  isVisible: ticketDoc.isVisible,
  createdAt: ticketDoc.createdAt.toISOString(),
  updatedAt: ticketDoc.updatedAt.toISOString(),
});
