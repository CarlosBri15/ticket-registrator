import { HttpException, HttpStatus } from '@nestjs/common';

export class DepartmentNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      id ? `Department with id "${id}" not found` : 'Department not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DepartmentConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class DepartmentAlreadyDeletedException extends HttpException {
  constructor() {
    super('Department is already deleted', HttpStatus.CONFLICT);
  }
}

export class DepartmentUnauthorizedException extends HttpException {
  constructor(message = 'You are not authorized to perform this action on the department') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
