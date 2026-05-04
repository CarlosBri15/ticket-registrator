import { ItemStatusType } from '../../statuses/item-status';

export interface IItem {
  id: string;
  name: string | null;
  amount: number | null;
  currency: string | null;
  status: ItemStatusType;
  categoryId: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
}

