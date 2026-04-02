import { ItemStatus } from './item-status';

describe('ItemStatus', () => {
    it('should have PENDING status', () => {
        expect(ItemStatus.PENDING).toBe('Pending');
    });

    it('should have APPROVED status', () => {
        expect(ItemStatus.APPROVED).toBe('Approved');
    });

    it('should have REJECTED status', () => {
        expect(ItemStatus.REJECTED).toBe('Rejected');
    });

    it('should have PARTIALLY_APPROVED status', () => {
        expect(ItemStatus.PARTIALLY_APPROVED).toBe('Partially_approved');
    });

    it('should have exactly 4 statuses', () => {
        expect(Object.keys(ItemStatus)).toHaveLength(4);
    });
});
