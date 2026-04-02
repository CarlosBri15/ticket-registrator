import { HttpException, HttpStatus } from '@nestjs/common';

export class OrganizationNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      id ? `Organization with id "${id}" not found` : 'Organization not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OrganizationConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class OrganizationAlreadyDeletedException extends HttpException {
  constructor() {
    super('Organization is already deleted', HttpStatus.CONFLICT);
  }
}

export class OrganizationUnauthorizedException extends HttpException {
  constructor(
    message = 'You are not authorized to perform this action on the organization',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
