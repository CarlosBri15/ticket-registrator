import { HttpException, HttpStatus } from '@nestjs/common';

export class ReportException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

export class ReportNotFoundException extends ReportException {
  constructor(id?: string) {
    super(
      id ? `Report with ID ${id} not found` : 'Report not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ReportAlreadyExistsException extends ReportException {
  constructor(message: string = 'A report already exists for this date range') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class ReportUnauthorizedException extends ReportException {
  constructor(
    message: string = 'You are not authorized to access this report',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ReportStatusConflictException extends ReportException {
  constructor(message: string = 'Report status does not allow this operation') {
    super(message, HttpStatus.CONFLICT);
  }
}
