import  type {TicketStatusType} from '../../statuses/ticket-status';
import { IItem } from './item.interface';
export interface ITicket {
  id: string;
  report_id: string;
  status: TicketStatusType;
  cgs_bucket_link: string;
  payment_type: string;
  expense_type: string;
  date: string;
  location_name: string;
  location_address: string;
  amount: number;
  currency: string;
  converted_amount: number;
  converted_currency: string;
  cgs_bucket_link_justification: string;
  last_four_digits: string;
  items?: IItem[];
  createdAt: string;
  updatedAt: string;
}
