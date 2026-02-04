import { registerSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';


export class CreateUserDto extends createZodDto(registerSchema) {}