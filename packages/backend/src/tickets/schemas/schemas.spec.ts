import { tickets, ticketRelations } from './ticket.schema';

describe('Ticket Schema', () => {
  it('should export tickets table', () => {
    expect(tickets).toBeDefined();
  });

  it('should export ticketRelations', () => {
    expect(ticketRelations).toBeDefined();
  });
});
