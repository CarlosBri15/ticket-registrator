import { HttpException, HttpStatus } from '@nestjs/common';

export class RoleNotFoundException extends HttpException {
    constructor(identifier: string) {
        super(`Role not found: ${identifier}`, HttpStatus.NOT_FOUND);
    }
}

export class RoleConflictException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.CONFLICT);
    }
}

export class RoleUnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized to perform this action on roles') {
        super(message, HttpStatus.FORBIDDEN);
    }
}

export class RoleSystemModificationException extends HttpException {
    constructor(message: string = 'Cannot modify system roles or permissions') {
        super(message, HttpStatus.FORBIDDEN);
    }
}
