import { items, itemRelations } from './item.schema';

describe('Item Schema', () => {
  it('should export items table', () => {
    expect(items).toBeDefined();
  });

  it('should export itemRelations', () => {
    expect(itemRelations).toBeDefined();
  });
});
