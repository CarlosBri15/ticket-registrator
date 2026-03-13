import { createRoleSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateRoleDto extends createZodDto(createRoleSchema) { }
