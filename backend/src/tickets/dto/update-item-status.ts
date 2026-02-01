import { IsIn } from 'class-validator';
import { ItemStatus } from '../status/item-status';

export class UpdateItemStatusDto {
  @IsIn([
    ItemStatus.PENDING,
    ItemStatus.APPROVED,
    ItemStatus.REJECTED,
    ItemStatus.PARTIALLY_APPROVED,
  ])
  status: typeof ItemStatus[keyof typeof ItemStatus];
}