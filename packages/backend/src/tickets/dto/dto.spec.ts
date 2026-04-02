import { CreateTicketDto } from './create-ticket.dto';
import { CreateItemDto } from './create-item.dto';

describe('Ticket DTOs', () => {
  it('should have CreateTicketDto defined', () => {
    expect(CreateTicketDto).toBeDefined();
  });

  it('should have CreateItemDto defined', () => {
    expect(CreateItemDto).toBeDefined();
  });
});
