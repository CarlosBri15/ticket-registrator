import { createTicketSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateTicketDto extends createZodDto(createTicketSchema) {}
