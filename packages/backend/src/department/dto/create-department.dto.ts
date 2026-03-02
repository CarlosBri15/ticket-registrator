import { registerDepartmentSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateDepartmentDto extends createZodDto(registerDepartmentSchema) { }
