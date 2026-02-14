import { createZodDto } from 'nestjs-zod';
import { updateUserSchema } from '@ticket-registrator/shared';

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
