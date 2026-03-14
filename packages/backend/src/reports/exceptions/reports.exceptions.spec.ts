import {
  ReportNotFoundException,
  ReportAlreadyExistsException,
  ReportUnauthorizedException,
  ReportStatusConflictException,
} from './reports.exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Reports Exceptions', () => {
  describe('ReportNotFoundException', () => {
    it('should include id in message when provided', () => {
      const ex = new ReportNotFoundException('report-1');
      expect(ex.message).toContain('report-1');
      expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use generic message when id not provided', () => {
      const ex = new ReportNotFoundException();
      expect(ex.message).toBe('Report not found');
    });
  });

  describe('ReportAlreadyExistsException', () => {
    it('should use default message', () => {
      const ex = new ReportAlreadyExistsException();
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should use custom message', () => {
      const ex = new ReportAlreadyExistsException('Custom message');
      expect(ex.message).toBe('Custom message');
    });
  });

  describe('ReportUnauthorizedException', () => {
    it('should use default message', () => {
      const ex = new ReportUnauthorizedException();
      expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should use custom message', () => {
      const ex = new ReportUnauthorizedException('Custom unauthorized');
      expect(ex.message).toBe('Custom unauthorized');
    });
  });

  describe('ReportStatusConflictException', () => {
    it('should use default message', () => {
      const ex = new ReportStatusConflictException();
      expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should use custom message', () => {
      const ex = new ReportStatusConflictException('Custom conflict');
      expect(ex.message).toBe('Custom conflict');
    });
  });
});
