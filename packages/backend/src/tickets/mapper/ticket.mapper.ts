import { Ticket } from '../schemas/ticket.schema';
import { ITicket, IItem } from '@ticket-registrator/shared';

export const mapTicketToITicket = (ticketDoc: Ticket): ITicket => ({
  id: ticketDoc.id,
  report_id: ticketDoc.reportId,
  status: ticketDoc.status as any,
  lifecycle: ticketDoc.lifecycle as any,
  version: ticketDoc.version,
  cgs_bucket_link: ticketDoc.cgsBucketLink,
  payment_type: ticketDoc.paymentType,
  expense_type: ticketDoc.expenseType,
  date: ticketDoc.date?.toISOString() ?? null,
  location_name: ticketDoc.locationName,
  location_address: ticketDoc.locationAddress,
  amount: ticketDoc.amount,
  currency: ticketDoc.currency,
  converted_amount: ticketDoc.convertedAmount,
  converted_currency: ticketDoc.convertedCurrency,
  cgs_bucket_link_justification: ticketDoc.cgsBucketLinkJustification,
  last_four_digits: ticketDoc.lastFourDigits,
  items: (ticketDoc.items as any[])?.map((item): IItem => ({
    id: '',
    name: item.name,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
  })) ?? [],
  isVisible: ticketDoc.isVisible ?? true,
  createdAt: ticketDoc.createdAt?.toISOString() ?? new Date().toISOString(),
  updatedAt: ticketDoc.updatedAt?.toISOString() ?? new Date().toISOString(),
});
