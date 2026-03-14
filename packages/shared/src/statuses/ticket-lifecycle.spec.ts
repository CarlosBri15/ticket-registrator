import { TicketLifecycle } from './ticket-lifecycle';

describe('TicketLifecycle', () => {
    it('should have DRAFT lifecycle', () => {
        expect(TicketLifecycle.DRAFT).toBe('Draft');
    });

    it('should have SUBMITTED lifecycle', () => {
        expect(TicketLifecycle.SUBMITTED).toBe('Submitted');
    });

    it('should have exactly 2 lifecycle values', () => {
        expect(Object.keys(TicketLifecycle)).toHaveLength(2);
    });
});
