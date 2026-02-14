import { createZodDto } from 'nestjs-zod';
import { updateTicketFieldsSchema, updateTicketStatusSchema, updateTicketLlmSchema} from '@ticket-registrator/shared';

export class UpdateTicketFieldsDto extends createZodDto(updateTicketFieldsSchema) {}
export class UpdateTicketStatusDto extends createZodDto(updateTicketStatusSchema) {}
export class UpdateTicketLlmDto extends createZodDto(updateTicketLlmSchema) {}

