import { TicketStatus } from './ticket-status';

describe('TicketStatus', () => {
    it('should have PENDING status', () => {
        expect(TicketStatus.PENDING).toBe('Pending');
    });

    it('should have APPROVED status', () => {
        expect(TicketStatus.APPROVED).toBe('Approved');
    });

    it('should have REJECTED status', () => {
        expect(TicketStatus.REJECTED).toBe('Rejected');
    });

    it('should have exactly 3 statuses', () => {
        expect(Object.keys(TicketStatus)).toHaveLength(3);
    });

    it('all values should be strings', () => {
        Object.values(TicketStatus).forEach(value => {
            expect(typeof value).toBe('string');
        });
    });
});
