import {
  TicketNotFoundException,
  TicketUnauthorizedException,
  TicketStatusConflictException,
  TicketStorageException,
} from './tickets.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Tickets Exceptions', () => {
  describe('TicketNotFoundException', () => {
    it('should include id in message when provided', () => {
      const ex = new TicketNotFoundException('ticket-1');
      expect(ex.message).toContain('ticket-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use generic message when id not provided', () => {
      const ex = new TicketNotFoundException();
      expect(ex.message).toBe('Ticket not found');
    });
  });

  describe('TicketUnauthorizedException', () => {
    it('should use default message', () => {
      const ex = new TicketUnauthorizedException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new TicketUnauthorizedException('Custom unauthorized');
      expect(ex.message).toBe('Custom unauthorized');
    });
  });

  describe('TicketStatusConflictException', () => {
    it('should use default message', () => {
      const ex = new TicketStatusConflictException();
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should use custom message', () => {
      const ex = new TicketStatusConflictException('Custom conflict');
      expect(ex.message).toBe('Custom conflict');
    });
  });

  describe('TicketStorageException', () => {
    it('should use default message', () => {
      const ex = new TicketStorageException();
      expect(ex.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should use custom message', () => {
      const ex = new TicketStorageException('Storage failed');
      expect(ex.message).toBe('Storage failed');
    });
  });
});
