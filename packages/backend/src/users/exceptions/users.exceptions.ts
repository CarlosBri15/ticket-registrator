import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`User with identifier ${identifier} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UserUnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized to perform this action on the user') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UserConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class UserBadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
