import { ItemNotFoundException } from './items.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Items Exceptions', () => {
  describe('ItemNotFoundException', () => {
    it('should include id in message when provided', () => {
      const ex = new ItemNotFoundException('item-1');
      expect(ex.message).toContain('item-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use generic message when no id provided', () => {
      const ex = new ItemNotFoundException();
      expect(ex.message).toBe('Item not found');
    });
  });
});
