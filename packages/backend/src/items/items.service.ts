import { Injectable, Logger } from '@nestjs/common';
import { IItem } from '@ticket-registrator/shared';
import { ItemsRepository } from './items.repository';
import { ItemNotFoundException } from './exceptions/items.exceptions';
import { InsertItem, Item } from './schemas/item.schema';

const mapItemToIItem = (item: Item): IItem => ({
  id: item.id,
  name: item.name,
  amount: item.amount,
  currency: item.currency,
  status: item.status,
  categoryId: item.categoryId,
});

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(private readonly itemsRepository: ItemsRepository) { }

  async findByTicketId(ticketId: string): Promise<IItem[]> {
    const items = await this.itemsRepository.findByTicketId(ticketId);
    return items.map(mapItemToIItem);
  }

  async findById(id: string): Promise<IItem> {
    const item = await this.itemsRepository.findById(id);
    if (!item) throw new ItemNotFoundException(id);
    return mapItemToIItem(item);
  }

  async bulkCreate(data: InsertItem[]): Promise<IItem[]> {
    const items = await this.itemsRepository.bulkCreate(data);
    this.logger.log(`Bulk created ${items.length} items`);
    return items.map(mapItemToIItem);
  }

  async bulkDeleteByTicketId(ticketId: string): Promise<void> {
    await this.itemsRepository.bulkDeleteByTicketId(ticketId);
    this.logger.log(`Bulk deleted items for ticket ${ticketId}`);
  }
}
