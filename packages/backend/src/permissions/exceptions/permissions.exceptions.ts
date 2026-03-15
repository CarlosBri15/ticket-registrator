import { HttpException, HttpStatus } from '@nestjs/common';

export class PermissionNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`Permission not found: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}

export class PermissionConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class PermissionAssignmentException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class PermissionUnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized to modify permissions') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
