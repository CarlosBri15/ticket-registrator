import { HttpException, HttpStatus } from '@nestjs/common';

export class TicketException extends HttpException {
    constructor(message: string, status: HttpStatus) {
        super(message, status);
    }
}

export class TicketNotFoundException extends TicketException {
    constructor(id?: string) {
        super(id ? `Ticket with ID ${id} not found` : 'Ticket not found', HttpStatus.NOT_FOUND);
    }
}

export class TicketUnauthorizedException extends TicketException {
    constructor(message: string = 'You are not authorized to access this ticket') {
        super(message, HttpStatus.FORBIDDEN);
    }
}

export class TicketStatusConflictException extends TicketException {
    constructor(message: string = 'Ticket status or report status does not allow this operation') {
        super(message, HttpStatus.CONFLICT);
    }
}

export class TicketStorageException extends TicketException {
    constructor(message: string = 'Failed to process ticket image storage') {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
