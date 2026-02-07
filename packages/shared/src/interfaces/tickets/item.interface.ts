import { ItemStatusType } from '../../statuses/item-status';

export interface IItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: ItemStatusType;
}
