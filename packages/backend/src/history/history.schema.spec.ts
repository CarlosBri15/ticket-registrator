import { ticketHistories, ticketHistoryRelations } from './history.schema';

describe('History Schema', () => {
  it('should export ticketHistories table', () => {
    expect(ticketHistories).toBeDefined();
  });

  it('should export ticketHistoryRelations', () => {
    expect(ticketHistoryRelations).toBeDefined();
  });
});
