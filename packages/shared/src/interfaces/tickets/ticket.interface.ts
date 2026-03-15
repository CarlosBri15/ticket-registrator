import type { TicketStatusType } from '../../statuses/ticket-status';
import type { TicketLifecycleType } from 'src/statuses/ticket-lifecycle';
import { IItem } from './item.interface';

export interface ITicket {
  id: string;
  report_id: string;
  lifecycle: TicketLifecycleType;
  version: number;
  status: TicketStatusType;
  cgs_bucket_link: string | null;
  payment_type: string | null;
  expense_type: string | null;
  date: string | null;
  location_name: string | null;
  location_address: string | null;
  amount: number | null;
  currency: string | null;
  converted_amount: number | null;
  converted_currency: string | null;
  cgs_bucket_link_justification: string | null;
  last_four_digits: string | null;
  flag: boolean;
  items?: IItem[];
  createdAt: string;
  updatedAt: string;
}

