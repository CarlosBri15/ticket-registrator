import { createItemSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateItemDto extends createZodDto(createItemSchema) {}
